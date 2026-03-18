import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button,
  Input,
  Select,
  Modal,
  Timeline,
  Descriptions,
  message,
  Popconfirm,
  Pagination
} from 'antd';
import { 
  EyeOutlined, 
  RedoOutlined, 
  StopOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { executionAPI } from '../services/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

const ExecutionLogs = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    workflow_id: ''
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const isDetailView = !!id;

  const fetchExecutions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.workflow_id && { workflow_id: filters.workflow_id })
      };
      
      const response = await executionAPI.getExecutions(params);
      
      setExecutions(response.data.executions);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.data.total
      }));
    } catch (error) {
      message.error('Failed to fetch executions');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionDetail = async (executionId) => {
    try {
      const response = await executionAPI.getExecution(executionId);
      setSelectedExecution(response.data);
    } catch (error) {
      message.error('Failed to fetch execution details');
    }
  };

  useEffect(() => {
    if (isDetailView) {
      fetchExecutionDetail(id);
    } else {
      fetchExecutions();
    }
  }, [id, filters]);

  const handleViewDetails = (execution) => {
    navigate(`/logs/${execution.id}`);
  };

  const handleRetry = async (executionId) => {
    try {
      await executionAPI.retryExecution(executionId);
      message.success('Execution retry initiated');
      fetchExecutions(pagination.current);
    } catch (error) {
      message.error('Failed to retry execution');
    }
  };

  const handleCancel = async (executionId) => {
    try {
      await executionAPI.cancelExecution(executionId);
      message.success('Execution cancelled');
      fetchExecutions(pagination.current);
    } catch (error) {
      message.error('Failed to cancel execution');
    }
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Workflow ID',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Version',
      dataIndex: 'workflow_version',
      key: 'workflow_version',
      width: 80,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <span className={`status-badge status-${status}`}>
          {status.toUpperCase()}
        </span>
      )
    },
    {
      title: 'Started',
      dataIndex: 'started_at',
      key: 'started_at',
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        const start = moment(record.started_at);
        const end = record.ended_at ? moment(record.ended_at) : moment();
        const duration = end.diff(start, 'seconds');
        return `${duration}s`;
      }
    },
    {
      title: 'Retries',
      dataIndex: 'retries',
      key: 'retries',
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
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          {record.status === 'failed' && (
            <Popconfirm
              title="Are you sure you want to retry this execution?"
              onConfirm={() => handleRetry(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="default"
                size="small"
                icon={<RedoOutlined />}
              >
                Retry
              </Button>
            </Popconfirm>
          )}
          {record.status === 'in_progress' && (
            <Popconfirm
              title="Are you sure you want to cancel this execution?"
              onConfirm={() => handleCancel(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<StopOutlined />}
              >
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const renderExecutionDetail = () => {
    if (!selectedExecution) {
      return (
        <Card className="workflow-card">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>Loading execution details...</div>
          </div>
        </Card>
      );
    }

    const { id, workflow_id, workflow_version, status, data, logs = [], started_at, ended_at, retries, triggered_by } = selectedExecution;

    return (
      <div className="fade-in">
        <div className="page-header">
          <h1>Execution Details</h1>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: 16 }}>
            View detailed execution information and timeline
          </p>
        </div>
        
        <Card className="workflow-card">
          <Descriptions title="Execution Information" bordered column={2}>
            <Descriptions.Item label="Execution ID">{id}</Descriptions.Item>
            <Descriptions.Item label="Workflow ID">{workflow_id}</Descriptions.Item>
            <Descriptions.Item label="Workflow Version">{workflow_version}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <span className={`status-badge status-${status}`}>
                {status.toUpperCase()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Started">
              {moment(started_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Ended">
              {ended_at 
                ? moment(ended_at).format('YYYY-MM-DD HH:mm:ss')
                : 'In Progress'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Retries">{retries}</Descriptions.Item>
            <Descriptions.Item label="Triggered By">{triggered_by}</Descriptions.Item>
          </Descriptions>

          <Card title="Input Data" size="small" style={{ marginTop: 16, marginBottom: 16 }}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>

          <Card title="Execution Timeline" size="small">
            <Timeline>
              {logs.map((log, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    log.status === 'completed' ? 'green' :
                    log.status === 'failed' ? 'red' :
                    log.status === 'in_progress' ? 'blue' : 'gray'
                  }
                >
                  <div>
                    <strong>{log.step_name}</strong> ({log.step_type})
                    <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                      {moment(log.started_at).format('HH:mm:ss')} - 
                      {log.ended_at ? moment(log.ended_at).format('HH:mm:ss') : 'Running'}
                      {log.ended_at && (
                        <span> ({moment(log.ended_at).diff(moment(log.started_at), 'seconds')}s)</span>
                      )}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`status-badge status-${log.status}`}>
                        {log.status.toUpperCase()}
                      </span>
                      {log.selected_next_step && (
                        <span style={{ marginLeft: 8, fontSize: 12 }}>
                          Next: {log.selected_next_step}
                        </span>
                      )}
                    </div>
                    {log.error_message && (
                      <div style={{ marginTop: 4, color: 'red', fontSize: 12 }}>
                        Error: {log.error_message}
                      </div>
                    )}
                    {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        <strong>Rules Evaluated:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
                          {log.evaluated_rules.map((rule, ruleIndex) => (
                            <li key={ruleIndex}>
                              <code>{rule.condition}</code> → 
                              <span style={{ 
                                color: rule.result ? 'green' : 'red',
                                fontWeight: 'bold'
                              }}>
                                {rule.result ? 'TRUE' : 'FALSE'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button onClick={() => navigate('/logs')}>
              Back to Execution Logs
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  if (isDetailView) {
    return renderExecutionDetail();
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Execution Logs</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: 16 }}>
          View detailed execution history and track workflow performance
        </p>
      </div>
      
      <Card className="workflow-card">
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <Option value="pending">Pending</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="canceled">Canceled</Option>
          </Select>

          <Input
            placeholder="Workflow ID"
            style={{ width: 250 }}
            value={filters.workflow_id}
            onChange={(e) => setFilters(prev => ({ ...prev, workflow_id: e.target.value }))}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchExecutions(1)}
          >
            Search
          </Button>
        </Space>

        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={executions}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>

        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={fetchExecutions}
          style={{ marginTop: 16, textAlign: 'right' }}
        />
      </Card>
    </div>
  );
};

export default ExecutionLogs;
