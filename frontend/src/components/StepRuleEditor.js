import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Space, 
  message,
  Table,
  Select,
  InputNumber,
  Switch,
  Popconfirm,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { ruleAPI, stepAPI } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const StepRuleEditor = ({ step, visible, onClose, onUpdate }) => {
  const [rules, setRules] = useState([]);
  const [allSteps, setAllSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [ruleForm] = Form.useForm();
  const [editingRule, setEditingRule] = useState(null);
  const [validating, setValidating] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await ruleAPI.getRules(step.id);
      setRules(response.data);
    } catch (error) {
      message.error('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSteps = async () => {
    try {
      const response = await stepAPI.getSteps(step.workflow_id);
      setAllSteps(response.data);
    } catch (error) {
      message.error('Failed to fetch steps');
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRules();
      fetchAllSteps();
    }
  }, [visible, step.id]);

  const handleCreateRule = async (values) => {
    try {
      const ruleData = {
        condition: values.condition,
        next_step_id: values.next_step_id,
        priority: values.priority,
        is_default: values.is_default || false
      };

      if (editingRule) {
        await ruleAPI.updateRule(editingRule.id, ruleData);
        message.success('Rule updated successfully');
      } else {
        await ruleAPI.createRule(step.id, ruleData);
        message.success('Rule created successfully');
      }

      setRuleModalVisible(false);
      ruleForm.resetFields();
      setEditingRule(null);
      fetchRules();
      onUpdate();
    } catch (error) {
      message.error('Failed to save rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await ruleAPI.deleteRule(ruleId);
      message.success('Rule deleted successfully');
      fetchRules();
      onUpdate();
    } catch (error) {
      message.error('Failed to delete rule');
    }
  };

  const validateCondition = async (condition) => {
    if (!condition) return;
    
    setValidating(true);
    try {
      const response = await ruleAPI.validateCondition(condition);
      if (response.data.valid) {
        message.success('Condition is valid');
      } else {
        message.error(`Invalid condition: ${response.data.error}`);
      }
    } catch (error) {
      message.error('Failed to validate condition');
    } finally {
      setValidating(false);
    }
  };

  const openRuleModal = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      ruleForm.setFieldsValue({
        condition: rule.condition,
        next_step_id: rule.next_step_id,
        priority: rule.priority,
        is_default: rule.is_default
      });
    }
    setRuleModalVisible(true);
  };

  const ruleColumns = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      ellipsis: true,
    },
    {
      title: 'Next Step',
      dataIndex: 'next_step_id',
      key: 'next_step_id',
      render: (nextStepId) => {
        const nextStep = allSteps.find(s => s.id === nextStepId);
        return nextStep ? nextStep.name : 'End';
      }
    },
    {
      title: 'Type',
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (isDefault) => (
        <Tag color={isDefault ? 'orange' : 'blue'}>
          {isDefault ? 'Default' : 'Conditional'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openRuleModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this rule?"
            onConfirm={() => handleDeleteRule(record.id)}
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

  const conditionExamples = [
    'amount > 1000',
    'country == "US"',
    'priority == "High" && amount > 500',
    'contains(department, "IT")',
    'startsWith(country, "U")',
    'amount >= 100 && amount <= 1000',
    'priority == "High" || priority == "Medium"'
  ];

  return (
    <Modal
      title={`Rules for Step: ${step.name}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openRuleModal()}
        >
          Add Rule
        </Button>
      </div>

      <Table
        columns={ruleColumns}
        dataSource={rules}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingRule ? 'Edit Rule' : 'Create Rule'}
        visible={ruleModalVisible}
        onCancel={() => {
          setRuleModalVisible(false);
          ruleForm.resetFields();
          setEditingRule(null);
        }}
        onOk={() => ruleForm.submit()}
        width={700}
      >
        <Form
          form={ruleForm}
          layout="vertical"
          onFinish={handleCreateRule}
        >
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please input priority!' }]}
          >
            <InputNumber
              min={1}
              placeholder="Lower numbers = higher priority"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Condition"
            name="condition"
            rules={[{ required: true, message: 'Please input condition!' }]}
            extra={
              <div>
                <div style={{ marginBottom: 8 }}>
                  <small>Available fields: amount, country, department, priority</small>
                </div>
                <div>
                  <small>Examples: </small>
                  {conditionExamples.map((example, index) => (
                    <Tag
                      key={index}
                      style={{ cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => ruleForm.setFieldsValue({ condition: example })}
                    >
                      {example}
                    </Tag>
                  ))}
                </div>
              </div>
            }
          >
            <TextArea
              rows={3}
              placeholder="e.g., amount > 1000 && country == 'US'"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              onClick={() => validateCondition(ruleForm.getFieldValue('condition'))}
              loading={validating}
            >
              Validate Condition
            </Button>
          </Form.Item>

          <Form.Item
            label="Next Step"
            name="next_step_id"
          >
            <Select placeholder="Select next step (leave empty for end)" allowClear>
              {allSteps
                .filter(s => s.id !== step.id)
                .map(s => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Default Rule"
            name="is_default"
            valuePropName="checked"
          >
            <Switch /> This rule will be used if no other rules match
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default StepRuleEditor;
