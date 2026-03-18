import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  message,
  Switch,
  Tabs,
  Table,
  Modal,
  Select,
  InputNumber,
  Tag,
  Popconfirm
} from 'antd';
import { 
  SaveOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowAPI, stepAPI } from '../services/api';
import StepRuleEditor from '../components/StepRuleEditor';

const { TextArea } = Input;
const { Option } = Select;

const WorkflowEditor = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [stepForm] = Form.useForm();
  const [editingStep, setEditingStep] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== 'new';

  const fetchWorkflow = useCallback(async () => {
    if (!isEditing) return;
    
    setLoading(true);
    try {
      const response = await workflowAPI.getWorkflow(id);
      const workflowData = response.data;
      setWorkflow(workflowData);
      setSteps(workflowData.steps || []);
      
      form.setFieldsValue({
        name: workflowData.name,
        input_schema: JSON.stringify(workflowData.input_schema, null, 2),
        is_active: workflowData.is_active,
        start_step_id: workflowData.start_step_id
      });
    } catch (error) {
      message.error('Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  }, [id, isEditing, form]);

  useEffect(() => {
    fetchWorkflow();
  }, [id, fetchWorkflow]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      let inputSchema = {};
      if (values.input_schema) {
        try {
          inputSchema = JSON.parse(values.input_schema);
        } catch (e) {
          message.error('Invalid JSON in input schema');
          return;
        }
      }

      const workflowData = {
        name: values.name,
        input_schema: inputSchema,
        is_active: values.is_active,
        start_step_id: values.start_step_id
      };

      if (isEditing) {
        await workflowAPI.updateWorkflow(id, workflowData);
        message.success('Workflow updated successfully');
      } else {
        const response = await workflowAPI.createWorkflow(workflowData);
        message.success('Workflow created successfully');
        navigate(`/workflows/${response.data.id}/edit`);
      }
    } catch (error) {
      message.error('Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStep = async (values) => {
    try {
      const stepData = {
        name: values.name,
        step_type: values.step_type,
        metadata: values.metadata ? JSON.parse(values.metadata) : {}
      };

      if (editingStep) {
        await stepAPI.updateStep(editingStep.id, stepData);
        message.success('Step updated successfully');
      } else {
        await stepAPI.createStep(workflow.id, stepData);
        message.success('Step created successfully');
      }

      setStepModalVisible(false);
      stepForm.resetFields();
      setEditingStep(null);
      fetchWorkflow();
    } catch (error) {
      message.error('Failed to save step');
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await stepAPI.deleteStep(stepId);
      message.success('Step deleted successfully');
      fetchWorkflow();
    } catch (error) {
      message.error('Failed to delete step');
    }
  };

  const openStepModal = (step = null) => {
    setEditingStep(step);
    if (step) {
      stepForm.setFieldsValue({
        name: step.name,
        step_type: step.step_type,
        metadata: JSON.stringify(step.metadata, null, 2)
      });
    }
    setStepModalVisible(true);
  };

  const stepColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'step_type',
      key: 'step_type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => setSelectedStep(record)}
          >
            Rules
          </Button>
          <Button
            size="small"
            onClick={() => openStepModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this step?"
            onConfirm={() => handleDeleteStep(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/workflows')}
            >
              Back
            </Button>
            {isEditing ? 'Edit Workflow' : 'Create Workflow'}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={loading}
          >
            Save
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Workflow Name"
            name="name"
            rules={[{ required: true, message: 'Please input workflow name!' }]}
          >
            <Input placeholder="Enter workflow name" />
          </Form.Item>

          <Form.Item
            label="Input Schema (JSON)"
            name="input_schema"
            rules={[{ required: true, message: 'Please input input schema!' }]}
          >
            <TextArea
              rows={6}
              placeholder='{"amount": {"type": "number", "required": true}, "country": {"type": "string", "required": true}}'
            />
          </Form.Item>

          <Form.Item
            label="Start Step"
            name="start_step_id"
          >
            <Select placeholder="Select start step" allowClear>
              {steps.map(step => (
                <Option key={step.id} value={step.id}>{step.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Card>

      {isEditing && (
        <Card title="Steps" style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openStepModal()}
            style={{ marginBottom: 16 }}
          >
            Add Step
          </Button>

          <Table
            columns={stepColumns}
            dataSource={steps}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      <Modal
        title={editingStep ? 'Edit Step' : 'Create Step'}
        visible={stepModalVisible}
        onCancel={() => {
          setStepModalVisible(false);
          stepForm.resetFields();
          setEditingStep(null);
        }}
        onOk={() => stepForm.submit()}
        width={600}
      >
        <Form
          form={stepForm}
          layout="vertical"
          onFinish={handleCreateStep}
        >
          <Form.Item
            label="Step Name"
            name="name"
            rules={[{ required: true, message: 'Please input step name!' }]}
          >
            <Input placeholder="Enter step name" />
          </Form.Item>

          <Form.Item
            label="Step Type"
            name="step_type"
            rules={[{ required: true, message: 'Please select step type!' }]}
          >
            <Select placeholder="Select step type">
              <Option value="task">Task</Option>
              <Option value="approval">Approval</Option>
              <Option value="notification">Notification</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Metadata (JSON)"
            name="metadata"
          >
            <TextArea
              rows={4}
              placeholder='{"assignee_email": "user@example.com", "instructions": "Review and approve"}'
            />
          </Form.Item>
        </Form>
      </Modal>

      {selectedStep && (
        <StepRuleEditor
          step={selectedStep}
          visible={!!selectedStep}
          onClose={() => setSelectedStep(null)}
          onUpdate={fetchWorkflow}
        />
      )}
    </div>
  );
};

export default WorkflowEditor;
