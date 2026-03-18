import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Pagination
} from 'antd';
import { 
  EyeOutlined, 
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { executionAPI } from '../services/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AuditLog = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    workflow_id: '',
    dateRange: null
  });
  const navigate = useNavigate();

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
      
      let executions = response.data.executions;
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        const [start, end] = filters.dateRange;
        executions = executions.filter(execution => {
          const executionDate = moment(execution.started_at);
          return executionDate.isBetween(start, end, 'day', '[]');
        });
      }
      
      setExecutions(executions);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: filters.dateRange ? executions.length : response.data.total
      }));
    } catch (error) {
      message.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [filters]);

  const handleViewDetails = (execution) => {
    navigate(`/logs/${execution.id}`);
  };

  const handleExport = () => {
    const csvContent = [
      ['Execution ID', 'Workflow ID', 'Version', 'Status', 'Started', 'Ended', 'Duration', 'Retries', 'Triggered By'].join(','),
      ...executions.map(execution => [
        execution.id,
        execution.workflow_id,
        execution.workflow_version,
        execution.status,
        moment(execution.started_at).format('YYYY-MM-DD HH:mm:ss'),
        execution.ended_at ? moment(execution.ended_at).format('YYYY-MM-DD HH:mm:ss') : '',
        execution.ended_at ? 
          moment(execution.ended_at).diff(moment(execution.started_at), 'seconds') + 's' : 
          'N/A',
        execution.retries,
        execution.triggered_by
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const getStatistics = () => {
    const total = executions.length;
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const inProgress = executions.filter(e => e.status === 'in_progress').length;
    
    return { total, completed, failed, inProgress };
  };

  const stats = getStatistics();

  const columns = [
    {
      title: 'Execution ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
      render: (id) => <code>{id}</code>
    },
    {
      title: 'Workflow ID',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      width: 200,
      ellipsis: true,
      render: (id) => <code>{id}</code>
    },
    {
      title: 'Version',
      dataIndex: 'workflow_version',
      key: 'workflow_version',
      width: 80,
      align: 'center'
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
      title: 'Ended',
      dataIndex: 'ended_at',
      key: 'ended_at',
      width: 150,
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        if (!record.ended_at) return '-';
        const start = moment(record.started_at);
        const end = moment(record.ended_at);
        const duration = end.diff(start, 'seconds');
        return `${duration}s`;
      }
    },
    {
      title: 'Retries',
      dataIndex: 'retries',
      key: 'retries',
      width: 80,
      align: 'center'
    },
    {
      title: 'Triggered By',
      dataIndex: 'triggered_by',
      key: 'triggered_by',
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Audit Log</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: 16 }}>
          Comprehensive audit trail with detailed execution analytics and export capabilities
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
            style={{ width: 200 }}
            value={filters.workflow_id}
            onChange={(e) => setFilters(prev => ({ ...prev, workflow_id: e.target.value }))}
          />

          <RangePicker
            style={{ width: 250 }}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            placeholder={['Start Date', 'End Date']}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchExecutions(1)}
          >
            Search
          </Button>

          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </Space>

        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <div>
              <strong>Total Executions:</strong> {stats.total}
            </div>
            <div>
              <strong style={{ color: '#52c41a' }}>Completed:</strong> {stats.completed}
            </div>
            <div>
              <strong style={{ color: '#ff4d4f' }}>Failed:</strong> {stats.failed}
            </div>
            <div>
              <strong style={{ color: '#1890ff' }}>In Progress:</strong> {stats.inProgress}
            </div>
            <div>
              <strong>Success Rate:</strong> {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={executions}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={fetchExecutions}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => 
            `${range[0]}-${range[1]} of ${total} executions`
          }
          style={{ marginTop: 16, textAlign: 'right' }}
        />
      </Card>
    </div>
  );
};

export default AuditLog;
