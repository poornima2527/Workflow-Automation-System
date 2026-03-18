import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  message,
  Space,
  Alert,
  Spin,
  Tag,
  Progress,
  Steps
} from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { workflowAPI, executionAPI } from '../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Step: AntStep } = Steps;

const WorkflowExecution = () => {
  const [form] = Form.useForm();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [execution, setExecution] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
    
    const workflowId = searchParams.get('workflowId');
    if (workflowId) {
      form.setFieldsValue({ workflow_id: workflowId });
      handleWorkflowChange(workflowId);
    }
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await workflowAPI.getWorkflows();
      setWorkflows(response.data.workflows.filter(w => w.is_active));
    } catch (error) {
      message.error('Failed to fetch workflows');
    }
  };

  const handleWorkflowChange = async (workflowId) => {
    try {
      const response = await workflowAPI.getWorkflow(workflowId);
      setSelectedWorkflow(response.data);
    } catch (error) {
      message.error('Failed to fetch workflow details');
    }
  };

  const handleExecute = async (values) => {
    setExecuting(true);
    try {
      let inputData = {};
      if (values.data) {
        try {
          inputData = JSON.parse(values.data);
        } catch (e) {
          message.error('Invalid JSON in input data');
          return;
        }
      }

      const response = await workflowAPI.executeWorkflow(values.workflow_id, {
        data: inputData
      });

      setExecution(response.data);
      message.success('Workflow execution started');
      
      pollExecution(response.data.id);
    } catch (error) {
      message.error('Failed to execute workflow');
    } finally {
      setExecuting(false);
    }
  };

  const pollExecution = async (executionId) => {
    const poll = async () => {
      try {
        const response = await executionAPI.getExecution(executionId);
        const updatedExecution = response.data;
        setExecution(updatedExecution);

        if (updatedExecution.status === 'in_progress') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Error polling execution:', error);
      }
    };

    poll();
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'default',
      'in_progress': 'processing',
      'completed': 'success',
      'failed': 'error',
      'canceled': 'warning'
    };
    return colors[status] || 'default';
  };

  const renderExecutionProgress = () => {
    if (!execution) return null;

    const { logs, status } = execution;
    const currentStepIndex = logs.findIndex(log => log.status === 'in_progress');
    const completedSteps = logs.filter(log => log.status === 'completed').length;

    return (
      <Card className="workflow-card" style={{ marginTop: 16 }}>
        <div className="page-header" style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Execution Progress</h3>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <span className={`status-badge status-${status}`}>
              {status.toUpperCase()}
            </span>
            <span style={{ marginLeft: 16 }}>
              Started: {moment(execution.started_at).format('YYYY-MM-DD HH:mm:ss')}
            </span>
            {execution.ended_at && (
              <span style={{ marginLeft: 16 }}>
                Ended: {moment(execution.ended_at).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            )}
          </div>

          {logs.length > 0 && (
            <Progress
              percent={Math.round((completedSteps / logs.length) * 100)}
              status={status === 'failed' ? 'exception' : status === 'completed' ? 'success' : 'active'}
            />
          )}

          <Steps
            current={currentStepIndex}
            direction="vertical"
            size="small"
          >
            {logs.map((log, index) => (
              <AntStep
                key={index}
                title={log.step_name}
                description={
                  <div>
                    <div>Type: {log.step_type}</div>
                    <div>Status: {log.status}</div>
                    {log.selected_next_step && (
                      <div>Next Step: {log.selected_next_step}</div>
                    )}
                    {log.error_message && (
                      <div style={{ color: 'red' }}>Error: {log.error_message}</div>
                    )}
                    <div>
                      Duration: {log.ended_at 
                        ? moment(log.ended_at).diff(moment(log.started_at), 'seconds') 
                        : moment().diff(moment(log.started_at), 'seconds')
                      }s
                    </div>
                  </div>
                }
                status={
                  log.status === 'completed' ? 'finish' :
                  log.status === 'failed' ? 'error' :
                  log.status === 'in_progress' ? 'process' : 'wait'
                }
                icon={log.status === 'completed' ? <CheckCircleOutlined /> : null}
              />
            ))}
          </Steps>

          {status === 'completed' && (
            <Alert
              message="Workflow Completed Successfully"
              type="success"
              showIcon
              action={
                <Button
                  size="small"
                  onClick={() => navigate(`/logs/${execution.id}`)}
                >
                  View Details
                </Button>
              }
            />
          )}

          {status === 'failed' && (
            <Alert
              message="Workflow Failed"
              description="The workflow execution encountered an error. Check the logs for details."
              type="error"
              showIcon
              action={
                <Space>
                  <Button
                    size="small"
                    onClick={() => navigate(`/logs/${execution.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={async () => {
                      try {
                        await executionAPI.retryExecution(execution.id);
                        message.success('Retry initiated');
                        pollExecution(execution.id);
                      } catch (error) {
                        message.error('Failed to retry execution');
                      }
                    }}
                  >
                    Retry
                  </Button>
                </Space>
              }
            />
          )}
        </Space>
      </Card>
    );
  };

  const renderInputSchema = () => {
    if (!selectedWorkflow || !selectedWorkflow.input_schema) return null;

    const schema = selectedWorkflow.input_schema;
    const fields = Object.keys(schema);

    if (fields.length === 0) return null;

    return (
      <Alert
        message="Expected Input Fields"
        description={
          <div>
            {fields.map(field => (
              <div key={field}>
                <strong>{field}</strong>: {schema[field].type || 'string'}
                {schema[field].required && <Tag color="red" size="small" style={{ marginLeft: 8 }}>Required</Tag>}
                {schema[field].allowed_values && (
                  <span style={{ marginLeft: 8, color: '#666' }}>
                    Allowed: {schema[field].allowed_values.join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        }
        type="info"
        style={{ marginBottom: 16 }}
      />
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Execute Workflow</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: 16 }}>
          Run your workflows with custom input data and monitor execution in real-time
        </p>
      </div>
      
      <Card className="workflow-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExecute}
        >
          <Form.Item
            label="Workflow"
            name="workflow_id"
            rules={[{ required: true, message: 'Please select a workflow!' }]}
          >
            <Select
              placeholder="Select a workflow to execute"
              onChange={handleWorkflowChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {workflows.map(workflow => (
                <Option key={workflow.id} value={workflow.id}>
                  {workflow.name} (v{workflow.version})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {renderInputSchema()}

          <Form.Item
            label="Input Data (JSON)"
            name="data"
            rules={[{ required: true, message: 'Please input execution data!' }]}
          >
            <TextArea
              rows={8}
              placeholder='{"amount": 1500, "country": "US", "department": "IT", "priority": "High"}'
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={executing}
              size="large"
              className="modern-button"
            >
              Execute Workflow
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {executing && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Executing workflow...</div>
          </div>
        </Card>
      )}

      {renderExecutionProgress()}
    </div>
  );
};

export default WorkflowExecution;
