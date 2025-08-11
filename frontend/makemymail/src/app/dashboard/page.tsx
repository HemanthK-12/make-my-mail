'use client'
import React, { useState, useEffect } from 'react';

export default function EmailDashboard() {
    const [activeTab, setActiveTab] = useState('inbox');
    const [selectedSender, setSelectedSender] = useState('sender');
    const [selectedEmails, setSelectedEmails] = useState(new Set());
    const [sortBy, setSortBy] = useState('sender');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedSenderInList, setSelectedSenderInList] = useState('Amazon');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Gmail API integration
    const [gmailData, setGmailData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Gmail data
    useEffect(() => {
        const fetchGmailData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/gmail/test-connection?maxResults=200', {
                    credentials: 'include'
                });
                const data = await response.json();
                setGmailData(data);
                
                // Set first sender as selected
                if (data.emails && data.emails.length > 0) {
                    setSelectedSenderInList(data.emails[0].sender_name);
                }
                
                setError(null);
            } catch (err) {
                setError('Failed to fetch emails');
            } finally {
                setLoading(false);
            }
        };
        
        fetchGmailData();
    }, []);

    // Dynamic data based on Gmail API
    const tabs = [
        { id: 'inbox', name: 'Inbox', count: gmailData?.total_messages_found ||0},
        { id: 'unread', name: 'Unread', count: gmailData?.emails.filter(e => e.is_unread).length || 0},
        { id: 'sent', name: 'Sent', count: 421 },
        { id: 'drafts', name: 'Drafts', count: 23}
    ];

    const senders = gmailData ? Object.values(
        gmailData.emails.reduce((acc, email) => {
            const key = email.sender_email;
            if (!acc[key]) {
                acc[key] = {
                    name: email.sender_name,
                    email: email.sender_email,
                    count: 0,
                    domain: email.sender_email.split('@')[1],
                    lastEmail: email.timestamp,
                    hasUnread: false
                };
            }
            acc[key].count++;
            if (email.timestamp > acc[key].lastEmail) {
                acc[key].lastEmail = email.timestamp;
            }
            if (email.is_unread) {
                acc[key].hasUnread = true;
            }
            return acc;
        }, {})
    ).sort((a, b) => b.lastEmail - a.lastEmail) : [];

    const emails = gmailData ? gmailData.emails.filter(email => 
        email.sender_name === selectedSenderInList || email.sender_email === selectedSenderInList
    ) : [];

    const filterOptions = [
        { id: 'all', name: 'All Emails', count: gmailData?.emails.length || 0 },
        { id: 'unread', name: 'Unread', count: gmailData?.emails.filter(e => e.is_unread).length || 0 },
        { id: 'today', name: 'Today', count: gmailData?.emails.filter(e => {
            const today = new Date().setHours(0,0,0,0);
            return new Date(e.timestamp).getTime() >= today;
        }).length || 0 }
    ];

    const sortOptions = [
        { value: 'sender', label: 'Sender Name' },
        { value: 'count', label: 'Email Count' },
        { value: 'date', label: 'Latest Email' },
        { value: 'domain', label: 'Domain' }
    ];

    const emailSortOptions = [
        { value: 'date', label: 'Date (Newest)' },
        { value: 'date-old', label: 'Date (Oldest)' },
        { value: 'subject', label: 'Subject (A-Z)' },
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

    const formatDate = (timestamp:number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return `${Math.floor(diffInHours * 60)} min ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else {
            return `${Math.floor(diffInHours / 24)} days ago`;
        }
    };

    const getCategoryIcon = (labels:string) => {
        if (labels?.includes('IMPORTANT')) return '⭐';
        if (labels?.includes('CATEGORY_PROMOTIONS')) return '🏷️';
        if (labels?.includes('CATEGORY_SOCIAL')) return '👥';
        return '📧';
    };

    // Define theme classes
    const themeClasses = {
        bg: isDarkMode ? 'bg-gray-900' : 'bg-slate-50',
        headerBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
        sidebarBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
        cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
        border: isDarkMode ? 'border-gray-700' : 'border-slate-200',
        text: isDarkMode ? 'text-gray-200' : 'text-slate-800',
        textSecondary: isDarkMode ? 'text-gray-400' : 'text-slate-600',
        button: isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
        input: isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-700'
    };

    // Loading state
    if (loading) {
        return (
            <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className={themeClasses.textSecondary}>Loading your emails...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className={`text-xl font-bold mb-2 ${themeClasses.text}`}>Connection Error</h2>
                    <p className={`mb-4 ${themeClasses.textSecondary}`}>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-inter ${themeClasses.bg}`}>
            {/* Header */}
            <header className={`px-6 py-4 flex justify-between items-center border-b ${themeClasses.headerBg} ${themeClasses.border}`}>
                <div className="flex items-center space-x-4">
                    <span 
                        className="material-symbols-outlined text-blue-600" 
                        style={{ fontSize: '48px' }}
                    >
                        forward_to_inbox
                    </span>
                    <h1 className="text-4xl font-bold text-slate-800">MakeMyMail</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    <div className="flex items-center space-x-2">
                        <span className={`text-sm ${themeClasses.textSecondary}`}>Sort by</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`px-3 py-1 border rounded text-sm ${themeClasses.input}`}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded transition-colors ${
                            showFilters 
                                ? 'bg-blue-100 text-blue-700' 
                                : themeClasses.button
                        }`}
                    >
                        Filters {showFilters ? '▼' : '▶'}
                    </button>
                    
                    <button className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 transition-colors">
                        Delete [{selectedEmails.size}]
                    </button>                    
                    <button className={`px-4 py-2 rounded transition-colors ${themeClasses.button}`}>
                        Sync to Gmail
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            {showFilters && (
                <div className={`px-6 py-3 border-b ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'
                }`}>
                    <div className="flex items-center space-x-4">
                        <span className={`text-sm font-medium ${themeClasses.text}`}>Quick Filters:</span>
                        {filterOptions.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    activeFilter === filter.id 
                                        ? 'bg-blue-600 text-white' 
                                        : `${themeClasses.cardBg} ${themeClasses.text} hover:bg-blue-100`
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
                <div className={`w-64 border-r flex flex-col ${themeClasses.sidebarBg} ${themeClasses.border}`}>
                    {/* Tab Navigation */}
                    <div className={`p-4 border-b ${themeClasses.border}`}>
                        <div className={`text-sm font-medium mb-3 ${themeClasses.text}`}>Email Categories</div>
                        <div className="space-y-1">
                            {tabs.slice(0, 4).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                                        activeTab === tab.id 
                                            ? 'bg-blue-100 text-blue-700 font-medium' 
                                            : `${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`
                                    }`}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>{tab.name}</span>
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="p-4 space-y-2">
                        <div className={`text-sm font-medium mb-3 ${themeClasses.text}`}>Tools</div>
                        
                        <button className="w-full text-left px-3 py-2 rounded bg-blue-100 text-blue-700 font-medium">
                            Mail Sorter
                        </button>
                        
                        <button className={`w-full text-left px-3 py-2 rounded transition-colors ${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`}>
                            Analytics
                        </button>
                        
                        <button className={`w-full text-left px-3 py-2 rounded transition-colors ${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`}>
                            AI Unsubscribe
                        </button>
                        
                        <button className={`w-full text-left px-3 py-2 rounded transition-colors ${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`}>
                            Email Scheduler
                        </button>

                        <button className={`w-full text-left px-3 py-2 rounded transition-colors ${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`}>
                            Smart Labels
                        </button>

                        <button className={`w-full text-left px-3 py-2 rounded transition-colors ${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`}>
                            Templates
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className={`mt-auto p-4 border-t ${themeClasses.border}`}>
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-600' : 'bg-slate-300'
                            }`}>
                                <svg className={`w-4 h-4 ${themeClasses.textSecondary}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className={`text-sm font-medium ${themeClasses.text}`}>
                                    {gmailData?.user_email?.split('@')[0] || 'User'}
                                </div>
                                <button className={`text-xs transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                                    sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section - Senders */}
                <div className={`w-80 border-r ${themeClasses.cardBg} ${themeClasses.border}`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`font-semibold ${themeClasses.text}`}>Top Senders</h2>
                            <select 
                                value={selectedSender} 
                                onChange={(e) => setSelectedSender(e.target.value)}
                                className={`px-2 py-1 border rounded text-sm ${themeClasses.input}`}
                            >
                                {emailSortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            {senders.map((sender) => (
                                <div 
                                    key={sender.email}
                                    onClick={() => setSelectedSenderInList(sender.name)}
                                    className={`p-3 rounded border cursor-pointer transition-colors ${
                                        selectedSenderInList === sender.name 
                                            ? 'border-blue-300 bg-blue-50' 
                                            : `${themeClasses.border} hover:bg-opacity-10 hover:bg-gray-500`
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-medium ${themeClasses.text}`}>{sender.name}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {sender.count}
                                            </span>
                                            {sender.hasUnread && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`text-xs space-y-1 ${themeClasses.textSecondary}`}>
                                        <div>{sender.domain}</div>
                                        <div>Last: {formatDate(sender.lastEmail)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Section - Email List */}
                <div className={`flex-1 ${themeClasses.cardBg}`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`font-semibold ${themeClasses.text}`}>
                                {selectedSenderInList} Emails ({emails.length})
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                    🔄 Refresh
                                </button>
                                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                    Select All
                                </button>
                                <button className={`px-3 py-1 text-sm rounded transition-colors ${themeClasses.button}`}>
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
                                            : `${themeClasses.border} hover:bg-opacity-10 hover:bg-gray-500`
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
                                            <div className={`font-medium ${
                                                email.is_unread 
                                                    ? `${themeClasses.text} font-bold`
                                                    : themeClasses.textSecondary
                                            }`}>
                                                {email.subject}
                                            </div>
                                            {email.is_unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                                        </div>
                                        <div className={`text-sm mb-1 ${themeClasses.textSecondary}`}>
                                            {email.snippet}
                                        </div>
                                        <div className={`flex items-center justify-between text-xs ${themeClasses.textSecondary}`}>
                                            <div className="flex items-center space-x-3">
                                                <span>{email.sender_email}</span>
                                                <span>{formatDate(email.timestamp)}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                email.is_unread ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {email.is_unread ? 'Unread' : 'Read'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {emails.length === 0 && selectedSenderInList && (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">📭</div>
                                <p className={themeClasses.textSecondary}>No emails found for {selectedSenderInList}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className={`border-t px-6 py-2 ${themeClasses.headerBg} ${themeClasses.border}`}>
                <div className={`flex items-center justify-between text-sm ${themeClasses.textSecondary}`}>
                    <div>
                        Connected as: <span className="font-medium">{gmailData?.user_email}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Total: {gmailData?.total_messages_found || 0} emails</span>
                        <span>Unread: {gmailData?.emails.filter(e => e.is_unread).length || 0}</span>
                        <span>Senders: {senders.length}</span>
                        <span>Showing: {gmailData?.emails_returned || 0} recent</span>
                    </div>
                </div>
            </div>
        </div>
    );
}