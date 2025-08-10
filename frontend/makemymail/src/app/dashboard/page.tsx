'use client'
import React, { useState } from 'react';

export default function EmailDashboard() {
    const [activeTab, setActiveTab] = useState('inbox');
    const [selectedSender, setSelectedSender] = useState('sender');
    const [selectedEmails, setSelectedEmails] = useState(new Set());
    const [sortBy, setSortBy] = useState('sender');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedSenderInList, setSelectedSenderInList] = useState('Amazon');

    const tabs = [
        { id: 'inbox', name: 'Inbox', count: 2847, icon: '📧' },
        { id: 'promotions', name: 'Promotions', count: 1253, icon: '🏷️' },
        { id: 'newsletters', name: 'Newsletters', count: 734, icon: '📰' },
        { id: 'social', name: 'Social', count: 892, icon: '👥' },
        { id: 'spam', name: 'Spam', count: 156, icon: '🚫' },
        { id: 'sent', name: 'Sent', count: 421, icon: '📤' },
        { id: 'drafts', name: 'Drafts', count: 23, icon: '📝' }
    ];

    const senders = [
        { id: 'amazon', name: 'Amazon', count: 47, domain: 'amazon.com', type: 'E-commerce', unsubscribable: true, lastEmail: '2 hours ago' },
        { id: 'linkedin', name: 'LinkedIn', count: 23, domain: 'linkedin.com', type: 'Social', unsubscribable: true, lastEmail: '5 hours ago' },
        { id: 'netflix', name: 'Netflix', count: 8, domain: 'netflix.com', type: 'Entertainment', unsubscribable: true, lastEmail: '1 day ago' },
        { id: 'github', name: 'GitHub', count: 15, domain: 'github.com', type: 'Development', unsubscribable: false, lastEmail: '3 hours ago' },
        { id: 'medium', name: 'Medium', count: 12, domain: 'medium.com', type: 'Newsletter', unsubscribable: true, lastEmail: '6 hours ago' },
        { id: 'stripe', name: 'Stripe', count: 6, domain: 'stripe.com', type: 'Business', unsubscribable: false, lastEmail: '4 days ago' }
    ];

    const emails = [
        { id: 1, subject: 'Your order has been shipped - Tracking included', sender: 'Amazon', date: '2 hours ago', size: '15KB', hasAttachment: false, isRead: false, priority: 'normal', category: 'order' },
        { id: 2, subject: 'Weekly deals you cannot miss!', sender: 'Amazon', date: '1 day ago', size: '234KB', hasAttachment: true, isRead: true, priority: 'low', category: 'promotion' },
        { id: 3, subject: 'Your delivery is arriving today', sender: 'Amazon', date: '2 days ago', size: '8KB', hasAttachment: false, isRead: true, priority: 'high', category: 'delivery' },
        { id: 4, subject: 'Black Friday Early Access - 50% off everything', sender: 'Amazon', date: '3 days ago', size: '456KB', hasAttachment: true, isRead: false, priority: 'normal', category: 'promotion' },
        { id: 5, subject: 'Review your recent purchase', sender: 'Amazon', date: '5 days ago', size: '12KB', hasAttachment: false, isRead: true, priority: 'low', category: 'review' }
    ];

    const filterOptions = [
        { id: 'all', name: 'All Emails', count: emails.length },
        { id: 'unread', name: 'Unread', count: emails.filter(e => !e.isRead).length },
        { id: 'attachments', name: 'With Attachments', count: emails.filter(e => e.hasAttachment).length },
        { id: 'important', name: 'Important', count: emails.filter(e => e.priority === 'high').length },
        { id: 'promotions', name: 'Promotions', count: emails.filter(e => e.category === 'promotion').length },
        { id: 'large', name: 'Large (>100KB)', count: emails.filter(e => parseInt(e.size) > 100).length }
    ];

    const sortOptions = [
        { value: 'sender', label: 'Sender Name' },
        { value: 'count', label: 'Email Count' },
        { value: 'date', label: 'Latest Email' },
        { value: 'domain', label: 'Domain' },
        { value: 'type', label: 'Category' },
        { value: 'size', label: 'Total Size' }
    ];

    const emailSortOptions = [
        { value: 'date', label: 'Date (Newest)' },
        { value: 'date-old', label: 'Date (Oldest)' },
        { value: 'subject', label: 'Subject (A-Z)' },
        { value: 'size', label: 'Size (Largest)' },
        { value: 'priority', label: 'Priority' },
        { value: 'read', label: 'Read Status' }
    ];

    const toggleEmailSelection = (emailId: number) => {
        const newSelected = new Set(selectedEmails);
        if (newSelected.has(emailId)) {
            newSelected.delete(emailId);
        } else {
            newSelected.add(emailId);
        }
        setSelectedEmails(newSelected);
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'normal': return 'text-blue-600 bg-blue-50';
            case 'low': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'order': return '📦';
            case 'promotion': return '🏷️';
            case 'delivery': return '🚚';
            case 'review': return '⭐';
            default: return '📧';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-200">
                <div className="flex items-center space-x-3">
                    <svg 
                        className="w-8 h-8 text-blue-600" 
                        viewBox="0 0 100 100" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M20 30 L50 20 L80 30 L80 70 L50 80 L20 70 Z" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            fill="none"
                        />
                        <path 
                            d="M20 30 L50 50 L80 30" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                    </svg>
                    <h1 className="text-xl font-bold text-slate-800">MakeMyMail</h1>
                </div>
                
                {/* Top Action Buttons */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">sort by</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-slate-300 rounded text-sm text-slate-700 bg-white"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded transition-colors ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        filters {showFilters ? '▼' : '▶'}
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 transition-colors">
                        delete ({selectedEmails.size})
                    </button>
                    <button className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded hover:bg-orange-200 transition-colors">
                        unsubscribe
                    </button>
                    <div className="relative">
                        <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                            actions ▼
                        </button>
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            {showFilters && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-700">Quick Filters:</span>
                        {filterOptions.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    activeFilter === filter.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-slate-700 hover:bg-blue-100'
                                }`}
                            >
                                {filter.name} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex h-screen">
                {/* Left Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                    {/* Tab Navigation */}
                    <div className="p-4 border-b border-slate-200">
                        <div className="text-sm font-medium text-slate-800 mb-3">Email Categories</div>
                        <div className="space-y-1">
                            {tabs.slice(0, 4).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                                        activeTab === tab.id 
                                            ? 'bg-blue-100 text-blue-700 font-medium' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>{tab.icon}</span>
                                        <span>{tab.name}</span>
                                    </span>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="p-4 space-y-2">
                        <div className="text-sm font-medium text-slate-800 mb-3">Tools</div>
                        
                        <button className="w-full text-left px-3 py-2 rounded bg-blue-100 text-blue-700 font-medium">
                            📊 Mail Sorter
                        </button>
                        
                        <button className="w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                            📈 Analytics
                        </button>
                        
                        <button className="w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                            🤖 AI Unsubscribe
                        </button>
                        
                        <button className="w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                            🔄 Email Scheduler
                        </button>

                        <button className="w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                            🏷️ Smart Labels
                        </button>

                        <button className="w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                            📋 Templates
                        </button>
                    </div>

                    {/* Additional Tabs */}
                    <div className="p-4 border-t border-slate-200">
                        <div className="text-sm font-medium text-slate-800 mb-3">Other</div>
                        <div className="space-y-1">
                            {tabs.slice(4).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-sm transition-colors ${
                                        activeTab === tab.id 
                                            ? 'bg-blue-100 text-blue-700 font-medium' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>{tab.icon}</span>
                                        <span>{tab.name}</span>
                                    </span>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="mt-auto p-4 border-t border-slate-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-800">Hemanth K.</div>
                                <button className="text-xs text-slate-600 hover:text-slate-800">sign out</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section - Senders */}
                <div className="w-80 bg-white border-r border-slate-200">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800">Top Senders</h2>
                            <select 
                                value={selectedSender} 
                                onChange={(e) => setSelectedSender(e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded text-sm bg-white"
                            >
                                {emailSortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            {senders.map((sender) => (
                                <div 
                                    key={sender.id}
                                    onClick={() => setSelectedSenderInList(sender.name)}
                                    className={`p-3 rounded border cursor-pointer transition-colors ${
                                        selectedSenderInList === sender.name 
                                            ? 'border-blue-300 bg-blue-50' 
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-700">{sender.name}</span>
                                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                            {sender.count}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <div>{sender.domain}</div>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                sender.type === 'E-commerce' ? 'bg-green-100 text-green-700' :
                                                sender.type === 'Social' ? 'bg-blue-100 text-blue-700' :
                                                sender.type === 'Newsletter' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {sender.type}
                                            </span>
                                            {sender.unsubscribable && (
                                                <span className="text-orange-600">🔗</span>
                                            )}
                                        </div>
                                        <div>Last: {sender.lastEmail}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Section - Email List */}
                <div className="flex-1 bg-white">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800">
                                {selectedSenderInList} Emails ({emails.length})
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                    Select All
                                </button>
                                <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">
                                    Clear
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {emails.map((email) => (
                                <div 
                                    key={email.id}
                                    className={`flex items-center space-x-3 p-3 border rounded transition-colors ${
                                        selectedEmails.has(email.id) 
                                            ? 'border-blue-300 bg-blue-50' 
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedEmails.has(email.id)}
                                        onChange={() => toggleEmailSelection(email.id)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-lg">{getCategoryIcon(email.category)}</span>
                                            <div className={`font-medium ${!email.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {email.subject}
                                            </div>
                                            {email.hasAttachment && <span className="text-slate-400">📎</span>}
                                            {!email.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                            <div className="flex items-center space-x-3">
                                                <span>{email.sender}</span>
                                                <span>{email.date}</span>
                                                <span>{email.size}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(email.priority)}`}>
                                                {email.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}