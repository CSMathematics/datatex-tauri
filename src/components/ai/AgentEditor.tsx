import React, { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
} from "@mantine/core";
import { useAIStore } from "../../stores/aiStore";
import { Agent } from "../../services/agentService";
import { v4 as uuidv4 } from "uuid";

interface AgentEditorProps {
  opened: boolean;
  onClose: () => void;
  agentToEdit?: Agent | null;
}

export const AgentEditor: React.FC<AgentEditorProps> = ({
  opened,
  onClose,
  agentToEdit,
}) => {
  const { createAgent, updateAgent } = useAIStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name);
      setDescription(agentToEdit.description);
      setSystemPrompt(agentToEdit.systemPrompt);
    } else {
      setName("");
      setDescription("");
      setSystemPrompt("You are a helpful AI assistant specialized in...");
    }
  }, [agentToEdit, opened]);

  const handleSave = () => {
    if (!name.trim()) return;

    if (agentToEdit) {
      updateAgent({
        ...agentToEdit,
        name,
        description,
        systemPrompt,
      });
    } else {
      createAgent({
        id: uuidv4(),
        name,
        description,
        systemPrompt,
      });
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={agentToEdit ? "Edit Agent" : "Create New Agent"}
      size="lg"
    >
      <Stack>
        <TextInput
          label="Name"
          placeholder="e.g., Geometry Expert"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Description"
          placeholder="Short description of what this agent does"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <Textarea
          label="System Instructions"
          placeholder="Describe the agent's persona and rules..."
          minRows={6}
          autosize
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.currentTarget.value)}
          description="The AI will follow these instructions. It also has access to database tools."
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Agent</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
