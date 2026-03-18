import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  SettingOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  ApartmentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import WorkflowExecution from './pages/WorkflowExecution';
import ExecutionLogs from './pages/ExecutionLogs';
import AuditLog from './pages/AuditLog';
import ApprovalDashboard from './pages/ApprovalDashboard';
import './App.css';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const [selectedKey, setSelectedKey] = React.useState('workflows');
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div className="sidebar-logo">
          <span>Workflow System</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            setSelectedKey(key);
            if (key === 'workflows') navigate('/workflows');
            if (key === 'execution') navigate('/execution');
            if (key === 'logs') navigate('/logs');
            if (key === 'audit') navigate('/audit');
            if (key === 'approvals') navigate('/approvals');
          }}
        >
          <Menu.Item key="workflows" icon={<ApartmentOutlined />}>
            Workflows
          </Menu.Item>
          <Menu.Item key="execution" icon={<PlayCircleOutlined />}>
            Execute Workflow
          </Menu.Item>
          <Menu.Item key="logs" icon={<HistoryOutlined />}>
            Execution Logs
          </Menu.Item>
          <Menu.Item key="approvals" icon={<CheckCircleOutlined />}>
            Approvals
          </Menu.Item>
          <Menu.Item key="audit" icon={<SettingOutlined />}>
            Audit Log
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1f2937' }}>
            {selectedKey === 'workflows' && 'Workflows'}
            {selectedKey === 'execution' && 'Execute Workflow'}
            {selectedKey === 'logs' && 'Execution Logs'}
            {selectedKey === 'approvals' && 'Approvals'}
            {selectedKey === 'audit' && 'Audit Log'}
          </h1>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: '24px' }}>
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
            <Route path="/workflows/new" element={<WorkflowEditor />} />
            <Route path="/execution" element={<WorkflowExecution />} />
            <Route path="/logs/:id" element={<ExecutionLogs />} />
            <Route path="/logs" element={<ExecutionLogs />} />
            <Route path="/approvals" element={<ApprovalDashboard />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
