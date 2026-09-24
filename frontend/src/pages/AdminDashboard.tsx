import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminUsersApi, fetchAdminPetsApi, AdminUser } from '../api/adminApi';
import { Pet } from '../api/petsApi';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Tag, Tabs, Button } from 'antd';
import { ShieldCheck, Users, Heart, RefreshCw } from 'lucide-react';
import { HeaderBar } from '../components/HeaderBar';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { 
    data: users, 
    isLoading: usersLoading, 
    refetch: refetchUsers 
  } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsersApi,
  });

  const { 
    data: pets, 
    isLoading: petsLoading, 
    refetch: refetchPets 
  } = useQuery<Pet[]>({
    queryKey: ['admin-pets'],
    queryFn: fetchAdminPetsApi,
  });

  const userColumns = [
    {
      title: 'User ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: number) => <span className="font-mono text-xs text-slate-400">#{id}</span>,
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-bold text-white text-xs">{name}</span>,
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span className="text-xs text-slate-300 font-mono">{email}</span>,
    },
    {
      title: 'System Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'gold' : 'blue'} className="rounded-full text-[10px] font-bold">
          {role}
        </Tag>
      ),
    },
  ];

  const petColumns = [
    {
      title: 'Pet ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: number) => <span className="font-mono text-xs text-slate-400">#{id}</span>,
    },
    {
      title: 'Pet Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Pet) => (
        <div className="flex items-center gap-2">
          {record.photoUrl ? (
            <img src={record.photoUrl} alt={name} className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <span className="text-sm">🐾</span>
          )}
          <span className="font-bold text-white text-xs">{name}</span>
        </div>
      ),
    },
    {
      title: 'Species / Breed',
      key: 'species',
      render: (record: Pet) => (
        <span className="text-xs text-slate-300">
          {record.species} ({record.breed || 'Mixed'})
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'MISSING' ? 'error' : 'success'} className="rounded-full text-[10px] font-bold">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Owner ID',
      dataIndex: 'ownerId',
      key: 'ownerId',
      width: 100,
      render: (ownerId: number) => <span className="font-mono text-xs text-[#00E599]">Owner #{ownerId}</span>,
    },
    {
      title: 'QR Token',
      dataIndex: 'qrToken',
      key: 'qrToken',
      render: (token: string) => <span className="font-mono text-[10px] text-slate-500">{token.substring(0, 12)}...</span>,
    },
  ];

  const tabItems = [
    {
      key: 'users',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Users className="w-4 h-4 text-[#00E599]" /> System Users ({users ? users.length : 0})
        </span>
      ),
      children: (
        <Table
          dataSource={users || []}
          columns={userColumns}
          rowKey="id"
          loading={usersLoading}
          pagination={{ pageSize: 8 }}
          className="dark-table"
        />
      ),
    },
    {
      key: 'pets',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Heart className="w-4 h-4 text-[#00E599]" /> Platform Pets ({pets ? pets.length : 0})
        </span>
      ),
      children: (
        <Table
          dataSource={pets || []}
          columns={petColumns}
          rowKey="id"
          loading={petsLoading}
          pagination={{ pageSize: 8 }}
          className="dark-table"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Dynamic Header Bar */}
      <HeaderBar pageType="admin" user={user} onLogout={handleLogout} />

      <main className="w-full max-w-7xl mx-auto flex-1 space-y-6">
        {/* Title & Refresh control */}
        <div className="flex justify-between items-center bg-[#0b0f19] p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl shadow-lg">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-heading">
                PetSafe Admin Management Panel
                <Tag color="gold" className="text-[10px] font-bold rounded-full">ADMIN ACCESS</Tag>
              </h1>
              <p className="text-xs text-slate-400">System-wide User & Pet Entity Overview</p>
            </div>
          </div>

          <Button
            icon={<RefreshCw className="w-3.5 h-3.5 inline mr-1" />}
            onClick={() => { refetchUsers(); refetchPets(); }}
            className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs h-9"
          >
            Refresh Data
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Total Registered Users</span>
              <span className="text-2xl font-black text-white font-mono">{users ? users.length : 0}</span>
            </div>
          </div>

          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E599]">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Total Tracked Pets</span>
              <span className="text-2xl font-black text-white font-mono">{pets ? pets.length : 0}</span>
            </div>
          </div>

          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              🚨
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Active Missing Pets</span>
              <span className="text-2xl font-black text-rose-400 font-mono">
                {pets ? pets.filter(p => p.status === 'MISSING').length : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Data Tabs */}
        <div className="bg-[#0b0f19] p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl">
          <Tabs defaultActiveKey="users" items={tabItems} className="dark-tabs" />
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto text-center text-xs text-slate-500 py-6 border-t border-slate-900 mt-12">
        PetSafe Administration Panel • Role-Restricted Platform Access
      </footer>
    </div>
  );
};
