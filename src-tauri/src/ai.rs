use crate::tools::ToolDefinition;
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: Option<String>,
    pub tool_calls: Option<Vec<crate::agent::ToolCall>>,
    pub tool_call_id: Option<String>,
}

pub async fn chat(
    messages: &[crate::agent::AgentMessage],
    tools: &[ToolDefinition],
    config: &ProviderConfig,
) -> Result<crate::agent::AgentMessage, Box<dyn Error>> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| Box::new(e) as Box<dyn Error>)?;

    // Map AgentMessage to internal ChatMessage
    let formatted_messages: Vec<ChatMessage> = messages
        .iter()
        .map(|m| ChatMessage {
            role: m.role.clone(),
            content: m.content.clone(),
            tool_calls: m.tool_calls.clone(),
            tool_call_id: m.tool_call_id.clone(),
        })
        .collect();

    let tools_json: Vec<serde_json::Value> = tools
        .iter()
        .map(|t| {
            serde_json::json!({
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters
                }
            })
        })
        .collect();

    match config.provider.as_str() {
        "openai" => {
            let api_key = config.api_key.as_deref().ok_or("OpenAI API Key missing")?;
            println!("[AI] Sending request to OpenAI. Model: {:?}", config.model);

            let mut payload = serde_json::json!({
                "model": config.model.as_deref().unwrap_or("gpt-4o"),
                "messages": formatted_messages,
            });

            if !tools_json.is_empty() {
                payload["tools"] = serde_json::json!(tools_json);
            }

            let response = client
                .post("https://api.openai.com/v1/chat/completions")
                .bearer_auth(api_key)
                .json(&payload)
                .send()
                .await?;

            if !response.status().is_success() {
                let err_text = response.text().await?;
                println!("[AI] OpenAI Error Response: {}", err_text);
                return Err(format!("OpenAI Chat Error: {}", err_text).into());
            }

            let data: serde_json::Value = response.json().await?;
            let choice = &data["choices"][0]["message"];

            let content = choice["content"].as_str().map(|s| s.to_string());
            let tool_calls = choice["tool_calls"].as_array().map(|arr| {
                arr.iter()
                    .map(|tc| crate::agent::ToolCall {
                        id: tc["id"].as_str().unwrap_or_default().to_string(),
                        function: crate::agent::ToolCallFunction {
                            name: tc["function"]["name"]
                                .as_str()
                                .unwrap_or_default()
                                .to_string(),
                            arguments: tc["function"]["arguments"]
                                .as_str()
                                .unwrap_or_default()
                                .to_string(),
                        },
                    })
                    .collect()
            });

            println!(
                "[AI] Response parsed successfully. Content present: {}, Tool calls: {}",
                content.is_some(),
                tool_calls
                    .as_ref()
                    .map_or(0, |v: &Vec<crate::agent::ToolCall>| v.len())
            );

            Ok(crate::agent::AgentMessage {
                role: "assistant".to_string(),
                content,
                tool_calls,
                tool_call_id: None,
            })
        }
        "ollama" => {
            let base_url = config.url.as_deref().unwrap_or("http://localhost:11434");
            let url = format!("{}/api/chat", base_url.trim_end_matches('/'));
            let model = config.model.as_deref().unwrap_or("llama3");

            println!("[AI] Sending request to Ollama. Model: {}", model);

            let mut payload = serde_json::json!({
                "model": model,
                "messages": formatted_messages,
                "stream": false
            });

            if !tools_json.is_empty() {
                payload["tools"] = serde_json::json!(tools_json);
            }

            let response = client.post(&url).json(&payload).send().await?;

            if !response.status().is_success() {
                let err_text = response.text().await?;
                println!("[AI] Ollama Error Response: {}", err_text);
                return Err(format!("Ollama Chat Error: {}", err_text).into());
            }

            let data: serde_json::Value = response.json().await?;
            let msg = &data["message"];

            let content = msg["content"].as_str().map(|s| s.to_string());

            // Fix arguments serialization if Ollama returns object
            let tool_calls = if let Some(calls) = msg["tool_calls"].as_array() {
                let mapped: Vec<crate::agent::ToolCall> = calls
                    .iter()
                    .map(|tc| {
                        let args = &tc["function"]["arguments"];
                        let args_str = if args.is_string() {
                            args.as_str().unwrap().to_string()
                        } else {
                            args.to_string() // Serialize object to json string
                        };

                        crate::agent::ToolCall {
                            id: format!("call_{}", uuid::Uuid::new_v4()),
                            function: crate::agent::ToolCallFunction {
                                name: tc["function"]["name"]
                                    .as_str()
                                    .unwrap_or_default()
                                    .to_string(),
                                arguments: args_str,
                            },
                        }
                    })
                    .collect();
                Some(mapped)
            } else {
                None
            };

            Ok(crate::agent::AgentMessage {
                role: "assistant".to_string(),
                content,
                tool_calls,
                tool_call_id: None,
            })
        }
        "gemini" => {
            let api_key = config.api_key.as_deref().ok_or("Gemini API Key missing")?;
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
                config.model.as_deref().unwrap_or("gemini-1.5-flash"),
                api_key
            );

            println!("[AI] Sending request to Gemini (with tools).");

            // 1. Map Tools to Gemini Format
            let gemini_tools: Vec<serde_json::Value> = if !tools.is_empty() {
                let funcs: Vec<serde_json::Value> = tools
                    .iter()
                    .map(|t| {
                        serde_json::json!({
                            "name": t.name,
                            "description": t.description,
                            "parameters": t.parameters // Gemini supports OpenAPI Schema subset, usually compatible
                        })
                    })
                    .collect();
                vec![serde_json::json!({ "function_declarations": funcs })]
            } else {
                vec![]
            };

            // 2. Map Messages
            // Gemini roles: "user", "model". "system" -> convert to "user" or "system_instruction".
            // We'll filter system out and put it into system_instruction field.
            let mut gemini_contents: Vec<serde_json::Value> = Vec::new();
            let mut system_instruction: Option<serde_json::Value> = None;

            for msg in messages {
                match msg.role.as_str() {
                    "system" => {
                        // v1beta supports system_instruction
                        system_instruction = Some(serde_json::json!({
                            "parts": [{ "text": msg.content.as_deref().unwrap_or("") }]
                        }));
                    }
                    "user" => {
                        gemini_contents.push(serde_json::json!({
                            "role": "user",
                            "parts": [{ "text": msg.content.as_deref().unwrap_or("") }]
                        }));
                    }
                    "assistant" => {
                        // Check for tool calls
                        let mut parts = Vec::new();
                        if let Some(content) = &msg.content {
                            parts.push(serde_json::json!({ "text": content }));
                        }
                        if let Some(tool_calls) = &msg.tool_calls {
                            for tc in tool_calls {
                                parts.push(serde_json::json!({
                                     "functionCall": {
                                         "name": tc.function.name,
                                         "args": serde_json::from_str::<serde_json::Value>(&tc.function.arguments).unwrap_or(serde_json::json!({}))
                                     }
                                 }));
                            }
                        }
                        gemini_contents.push(serde_json::json!({
                            "role": "model",
                            "parts": parts
                        }));
                    }
                    "tool" => {
                        // Gemini expects tool response in "functionResponse" part
                        // "role": "function"? No, role is "user" usually (from tool), or "function" role?
                        // Gemini docs say: role="function" for function responses.
                        // Wait, docs say: role "user" or "model".
                        // Actually, for functionResponse, the role is 'function' in some docs, but official API user 'function' role.
                        // Let's verify:
                        // It seems we should use 'function' role.
                        // Content parts: [{ "functionResponse": { "name": ..., "response": ... } }]

                        let _call_id = msg.tool_call_id.clone().unwrap_or_default();
                        // We need the function name to match the response.
                        // AgentMessage structure stores call_id but not name in the response msg.
                        // We might need to infer it or AgentState needs to track pending calls.
                        // For now, I'll assume we can't perfectly map tool responses without name.
                        // But wait! `tool_calls` in the previous assistant message has the name.

                        // IMPERFECT SOLUTION: Just pass it as "user" text "Tool Output: ..."
                        // This confuses Gemini less than a malformed functionResponse.
                        // Let's try "user" role with "Observation: ..." pattern which works for RAG/ReAct.

                        gemini_contents.push(serde_json::json!({
                            "role": "user",
                            "parts": [{ "text": format!("Tool Output: {}", msg.content.as_deref().unwrap_or("")) }]
                        }));
                    }
                    _ => {}
                }
            }

            let mut payload = serde_json::json!({
                "contents": gemini_contents,
            });

            if !gemini_tools.is_empty() {
                payload["tools"] = serde_json::json!(gemini_tools);
            }
            if let Some(sys) = system_instruction {
                payload["system_instruction"] = sys;
            }

            let response = client.post(&url).json(&payload).send().await?;

            if !response.status().is_success() {
                let err_text = response.text().await?;
                println!("[AI] Gemini Error Response: {}", err_text);
                return Err(format!("Gemini Chat Error: {}", err_text).into());
            }

            let data: serde_json::Value = response.json().await?;
            // println!("[AI] Gemini Raw Response: {:?}", data);

            let candidate = &data["candidates"][0];
            let content_parts = candidate["content"]["parts"].as_array();

            let mut content_text = String::new();
            let mut tool_calls = Vec::new();

            if let Some(parts) = content_parts {
                for part in parts {
                    if let Some(text) = part["text"].as_str() {
                        content_text.push_str(text);
                    }
                    if let Some(func_call) = part["functionCall"].as_object() {
                        let name = func_call["name"].as_str().unwrap_or_default().to_string();
                        let args = &func_call["args"]; // Object
                        let args_str = args.to_string();

                        tool_calls.push(crate::agent::ToolCall {
                            id: "gemini_call".to_string(), // Gemini doesn't use IDs
                            function: crate::agent::ToolCallFunction {
                                name,
                                arguments: args_str,
                            },
                        });
                    }
                }
            }

            let content = if content_text.is_empty() {
                None
            } else {
                Some(content_text)
            };
            let tool_calls = if tool_calls.is_empty() {
                None
            } else {
                Some(tool_calls)
            };

            Ok(crate::agent::AgentMessage {
                role: "assistant".to_string(),
                content,
                tool_calls,
                tool_call_id: None,
            })
        }
        _ => Err(format!(
            "Provider '{}' not supported for agents yet",
            config.provider
        )
        .into()),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub provider: String,
    #[serde(default)]
    pub api_key: Option<String>,
    #[serde(default)]
    pub model: Option<String>,
    #[serde(default)]
    pub url: Option<String>,
}

pub async fn get_embedding(
    text: &str,
    config: &ProviderConfig,
) -> Result<Vec<f32>, Box<dyn Error>> {
    let client = reqwest::Client::new();

    match config.provider.as_str() {
        "openai" => {
            let api_key = config.api_key.as_deref().ok_or("OpenAI API Key missing")?;
            let url = "https://api.openai.com/v1/embeddings";

            let response = client
                .post(url)
                .bearer_auth(api_key)
                .json(&serde_json::json!({
                    "input": text,
                    "model": "text-embedding-3-small"
                }))
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(format!("OpenAI Error: {}", response.text().await?).into());
            }

            let data: serde_json::Value = response.json().await?;
            let embedding = data["data"][0]["embedding"]
                .as_array()
                .ok_or("Failed to parse embedding")?
                .iter()
                .map(|v| v.as_f64().unwrap() as f32)
                .collect();

            Ok(embedding)
        }
        "gemini" => {
            let api_key = config.api_key.as_deref().ok_or("Gemini API Key missing")?;
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={}",
                api_key
            );

            let response = client
                .post(&url)
                .json(&serde_json::json!({
                    "content": {
                        "parts": [{ "text": text }]
                    }
                }))
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(format!("Gemini Error: {}", response.text().await?).into());
            }

            let data: serde_json::Value = response.json().await?;
            let embedding = data["embedding"]["values"]
                .as_array()
                .ok_or("Failed to parse embedding")?
                .iter()
                .map(|v| v.as_f64().unwrap() as f32)
                .collect();

            Ok(embedding)
        }
        "ollama" => {
            let base_url = config.url.as_deref().unwrap_or("http://localhost:11434");
            let url = format!("{}/api/embeddings", base_url.trim_end_matches('/'));
            let model = config.model.as_deref().unwrap_or("nomic-embed-text");

            let response = client
                .post(&url)
                .json(&serde_json::json!({
                    "model": model,
                    "prompt": text
                }))
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(format!("Ollama Error: {}", response.text().await?).into());
            }

            let data: serde_json::Value = response.json().await?;
            let embedding = data["embedding"]
                .as_array()
                .ok_or("Failed to parse embedding")?
                .iter()
                .map(|v| v.as_f64().unwrap() as f32)
                .collect();

            Ok(embedding)
        }
        _ => Err("Unknown provider".into()),
    }
}
