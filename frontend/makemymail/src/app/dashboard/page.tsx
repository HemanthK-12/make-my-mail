'use client'
import React, { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('inbox');
    const [selectedSender, setSelectedSender] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedEmails, setSelectedEmails] = useState(new Set<string>());
    const [selectedEmailsData, setSelectedEmailsData] = useState<any[]>([]);
    const [deletedEmails, setDeletedEmails] = useState(new Set<string>());
    const [deletedEmailsData, setDeletedEmailsData] = useState<any[]>([]);
    const [lastDeletedEmails, setLastDeletedEmails] = useState(new Set<string>());
    const [lastDeletedEmailsData, setLastDeletedEmailsData] = useState<any[]>([]);
    const [showSyncPopup, setShowSyncPopup] = useState(false);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [sortBy, setSortBy] = useState('sender');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedSenderInList, setSelectedSenderInList] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Resizable panel widths
    const [leftPanelWidth, setLeftPanelWidth] = useState(256);
    const [middlePanelWidth, setMiddlePanelWidth] = useState(320);
    const [isResizing, setIsResizing] = useState({ left: false, middle: false });
    
    // Gmail API integration
    const [gmailData, setGmailData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emailStats, setEmailStats] = useState<any>(null);
    const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });

    // Mouse move handler for resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing.left) {
                const newWidth = Math.max(200, Math.min(400, e.clientX));
                setLeftPanelWidth(newWidth);
            } else if (isResizing.middle) {
                const newWidth = Math.max(280, Math.min(500, e.clientX - leftPanelWidth));
                setMiddlePanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing({ left: false, middle: false });
        };

        if (isResizing.left || isResizing.middle) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [isResizing, leftPanelWidth]);

    // Fetch Gmail data with progress tracking
    useEffect(() => {
        const fetchGmailData = async () => {
            try {
                setLoading(true);
                
                // Check URL params to determine if fetchAll should be true
                const urlParams = new URLSearchParams(window.location.search);
                const fetchAll = urlParams.get('fetchAll') === 'true';
                
                if (fetchAll) {
                    // Fetch emails with progress updates for fetchAll=true
                    await fetchEmailsWithProgress();
                } else {
                    // Simple fetch for normal case
                    const response = await fetch('http://localhost:8080/api/gmail/fetch-mails?batchSize=100', {
                        credentials: 'include'
                    });
                    const data = await response.json();
                    setGmailData(data);
                    
                    if (data.emails && data.emails.length > 0) {
                        setSelectedSenderInList(data.emails[0].sender_name);
                    }
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

    const fetchEmailsWithProgress = async () => {
        try {
            let allEmails: any[] = [];
            let nextPageToken: string | null = null;
            let estimatedTotal = 0;
            
            do {
                const url = nextPageToken 
                    ? `http://localhost:8080/api/gmail/fetch-mails-continuation?pageToken=${nextPageToken}&batchSize=100&fetchAll=true`
                    : `http://localhost:8080/api/gmail/fetch-mails?batchSize=100&fetchAll=true`;
                
                const response = await fetch(url, {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    allEmails = [...allEmails, ...data.emails];
                    
                    // Update estimated total from first response
                    if (data.estimated_inbox_total && estimatedTotal === 0) {
                        estimatedTotal = data.estimated_inbox_total;
                    }
                    
                    // Update progress with current fetch count
                    setFetchProgress({ 
                        current: allEmails.length, 
                        total: estimatedTotal || allEmails.length 
                    });
                    
                    // Set first sender as selected
                    if (allEmails.length > 0 && !selectedSenderInList) {
                        setSelectedSenderInList(allEmails[0].sender_name);
                    }
                    
                    nextPageToken = data.next_page_token;
                    
                    // Create combined response
                    const combinedData = {
                        ...data,
                        emails: allEmails,
                        total_emails_fetched: allEmails.length,
                        estimated_inbox_total: estimatedTotal
                    };
                    setGmailData(combinedData);
                    
                    // Small delay to show progress animation
                    if (nextPageToken) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } else {
                    throw new Error(data.message);
                }
            } while (nextPageToken);
            
        } catch (error) {
            throw error;
        }
    };

    const tabs = [
        { id: 'inbox', name: 'Inbox', count: gmailData?.total_emails_fetched || 0},
        { id: 'unread', name: 'Updates', count: gmailData?.emails?.filter((e: any) => e.is_unread).length || 0},
        { id: 'sent', name: 'Promotions', count: 421 },
        { id: 'drafts', name: 'Social', count: 23}
    ];

    const senders = gmailData ? Object.values(
        gmailData.emails.reduce((acc: any, email: any) => {
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
    ).sort((a: any, b: any) => b.count - a.count) : [];

    const filterOptions = [
        { id: 'all', name: 'All Emails', count: gmailData?.emails?.length || 0 },
        { id: 'unread', name: 'Unread', count: gmailData?.emails?.filter((e: any) => e.is_unread).length || 0 },
        { id: 'today', name: 'Today', count: gmailData?.emails?.filter((e: any) => {
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
        { value: 'date', label: 'Date' },
        { value: 'sender-name', label: 'Sender Name' },
        { value: 'subject', label: 'Subject' },
        { value: 'read', label: 'Read Status' }
    ];

    const getSortOrderOptions = (sortType: string) => {
        switch(sortType) {
            case 'date':
                return [
                    { value: 'desc', label: 'Newest First' },
                    { value: 'asc', label: 'Oldest First' }
                ];
            case 'sender-name':
                return [
                    { value: 'asc', label: 'A to Z' },
                    { value: 'desc', label: 'Z to A' }
                ];
            case 'subject':
                return [
                    { value: 'asc', label: 'A to Z' },
                    { value: 'desc', label: 'Z to A' }
                ];
            case 'read':
                return [
                    { value: 'unread', label: 'Unread First' },
                    { value: 'read', label: 'Read First' }
                ];
            default:
                return [
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' }
                ];
        }
    };

    const sortedEmails = gmailData ? gmailData.emails
        .filter((email: any) => email.sender_name === selectedSenderInList || email.sender_email === selectedSenderInList)
        .filter((email: any) => !deletedEmails.has(email.id)) // Filter out deleted emails
        .sort((a: any, b: any) => {
            switch(selectedSender) {
                case 'date':
                    return sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
                case 'sender-name':
                    const nameA = a.sender_name.toLowerCase();
                    const nameB = b.sender_name.toLowerCase();
                    if (sortOrder === 'asc') {
                        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
                    } else {
                        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
                    }
                case 'subject':
                    const subjectA = (a.subject || '').toLowerCase();
                    const subjectB = (b.subject || '').toLowerCase();
                    if (sortOrder === 'asc') {
                        return subjectA < subjectB ? -1 : subjectA > subjectB ? 1 : 0;
                    } else {
                        return subjectA > subjectB ? -1 : subjectA < subjectB ? 1 : 0;
                    }
                case 'read':
                    if (sortOrder === 'unread') {
                        return b.is_unread - a.is_unread;
                    } else {
                        return a.is_unread - b.is_unread;
                    }
                default:
                    return 0;
            }
        }) : [];

    const toggleEmailSelection = (emailId: string) => {
        const newSelected = new Set(selectedEmails);
        const newSelectedData = [...selectedEmailsData];
        
        if (newSelected.has(emailId)) {
            // Remove from selection
            newSelected.delete(emailId);
            const index = newSelectedData.findIndex(email => email.id === emailId);
            if (index > -1) {
                newSelectedData.splice(index, 1);
            }
        } else {
            // Add to selection
            newSelected.add(emailId);
            const emailData = sortedEmails.find((email: any) => email.id === emailId);
            if (emailData) {
                newSelectedData.push({
                    id: emailData.id,
                    subject: emailData.subject || 'No Subject',
                    sender_name: emailData.sender_name,
                    sender_email: emailData.sender_email,
                    timestamp: emailData.timestamp,
                    is_unread: emailData.is_unread,
                    snippet: emailData.snippet || 'No preview available'
                });
            }
        }
        
        setSelectedEmails(newSelected);
        setSelectedEmailsData(newSelectedData);
    };

    const formatDate = (timestamp: number) => {
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

    const truncateText = (text: string, maxWidth: number, baseLength: number = 20) => {
        if (!text) return '';
        const ratio = maxWidth / 320;
        const adjustedLength = Math.max(10, Math.floor(baseLength * ratio));
        return text.length > adjustedLength ? text.substring(0, adjustedLength) + '...' : text;
    };

    const handleDeleteEmails = () => {
        if (selectedEmails.size === 0) return;
        
        // Store last deleted state for undo
        setLastDeletedEmails(new Set(selectedEmails));
        setLastDeletedEmailsData([...selectedEmailsData]);
        
        // Move selected emails to deleted state
        const newDeletedEmails = new Set([...deletedEmails, ...selectedEmails]);
        const newDeletedEmailsData = [...deletedEmailsData, ...selectedEmailsData];
        
        setDeletedEmails(newDeletedEmails);
        setDeletedEmailsData(newDeletedEmailsData);
        
        // Clear current selections
        setSelectedEmails(new Set());
        setSelectedEmailsData([]);
    };

    const handleUndoLastDelete = () => {
        if (lastDeletedEmails.size === 0) return;
        
        // Remove last deleted emails from deleted state
        const newDeletedEmails = new Set(deletedEmails);
        const newDeletedEmailsData = [...deletedEmailsData];
        
        lastDeletedEmails.forEach(emailId => {
            newDeletedEmails.delete(emailId);
        });
        
        // Remove from deleted emails data
        lastDeletedEmailsData.forEach(email => {
            const index = newDeletedEmailsData.findIndex(item => item.id === email.id);
            if (index > -1) {
                newDeletedEmailsData.splice(index, 1);
            }
        });
        
        setDeletedEmails(newDeletedEmails);
        setDeletedEmailsData(newDeletedEmailsData);
        
        // Clear last deleted state
        setLastDeletedEmails(new Set());
        setLastDeletedEmailsData([]);
    };

    const handleSelectAll = () => {
        const allCurrentEmails = sortedEmails;
        const newSelected = new Set<string>();
        const newSelectedData: any[] = [];
        
        allCurrentEmails.forEach((email: any) => {
            newSelected.add(email.id);
            newSelectedData.push({
                id: email.id,
                subject: email.subject || 'No Subject',
                sender_name: email.sender_name,
                sender_email: email.sender_email,
                timestamp: email.timestamp,
                is_unread: email.is_unread,
                snippet: email.snippet || 'No preview available'
            });
        });
        
        setSelectedEmails(newSelected);
        setSelectedEmailsData(newSelectedData);
    };

    const handleClearSelection = () => {
        setSelectedEmails(new Set());
        setSelectedEmailsData([]);
    };

    const handleUndoFromPopup = (emailId: string) => {
        // Remove from deleted emails
        const newDeletedEmails = new Set(deletedEmails);
        newDeletedEmails.delete(emailId);
        
        const newDeletedEmailsData = deletedEmailsData.filter(email => email.id !== emailId);
        
        setDeletedEmails(newDeletedEmails);
        setDeletedEmailsData(newDeletedEmailsData);
        
        // Close popup if no more emails to sync
        if (newDeletedEmailsData.length === 0) {
            setShowSyncPopup(false);
        }
    };

    const handleConfirmSync = async () => {
        try {
            setSyncInProgress(true);
            const emailIds = deletedEmailsData.map(email => email.id);
            
            const response = await fetch('http://localhost:8080/api/gmail/move-to-trash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(emailIds)
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Clear deleted emails tracking after successful sync
                setDeletedEmails(new Set());
                setDeletedEmailsData([]);
                setShowSyncPopup(false);
                
                alert(`Successfully moved ${result.successful_moves} email(s) to trash!`);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Move to trash failed:', error);
            alert('Failed to move emails to trash. Please try again.');
        } finally {
            setSyncInProgress(false);
        }
    };

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

    if (loading) {
        const progressPercentage = fetchProgress.total > 0 
            ? Math.min(100, Math.round((fetchProgress.current / fetchProgress.total) * 100))
            : 0;
            
        const showProgressBar = fetchProgress.total > 0 && fetchProgress.current >= 0;
        
        return (
            <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
                <div className="text-center max-w-lg w-full mx-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
                    <p className={`mb-6 text-lg ${themeClasses.text}`}>Loading your emails...</p>
                    
                    {showProgressBar ? (
                        <div className="w-full">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            
                            {/* Progress Info */}
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-sm font-medium ${themeClasses.text}`}>
                                    {fetchProgress.current.toLocaleString()} of {fetchProgress.total.toLocaleString()} emails
                                </span>
                                <span className={`text-lg font-bold ${themeClasses.text}`}>
                                    {progressPercentage}%
                                </span>
                            </div>
                            
                            {/* Status Message */}
                            <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>
                                Fetching all emails from your inbox...
                            </p>
                            
                            {/* ETA Estimation */}
                            {fetchProgress.current > 0 && progressPercentage < 100 && (
                                <p className={`text-xs ${themeClasses.textSecondary}`}>
                                    Please wait, this may take a few minutes for large inboxes
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                            Connecting to Gmail...
                        </p>
                    )}
                </div>
            </div>
        );
    }

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
                    <h1 className={`text-4xl font-bold ${themeClasses.text}`}>MakeMyMail</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
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
                    
                    <button 
                        className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 transition-colors"
                        onClick={handleDeleteEmails}
                        disabled={selectedEmails.size === 0}
                    >
                        Delete [{selectedEmails.size}]
                    </button>
                    
                    <button 
                        className={`px-4 py-2 rounded transition-colors ${
                            lastDeletedEmails.size > 0 
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleUndoLastDelete}
                        disabled={lastDeletedEmails.size === 0}
                    >
                        ↶ Undo ({lastDeletedEmails.size})
                    </button>                    
                    <button 
                        className={`px-4 py-2 rounded transition-colors ${themeClasses.button}`}
                        onClick={() => {
                            if (deletedEmailsData.length > 0) {
                                setShowSyncPopup(true);
                            }
                        }}
                    >
                        Sync to Gmail {deletedEmailsData.length > 0 && `(${deletedEmailsData.length} pending)`}
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

            {/* Main Content */}
            <div className="flex relative" style={{ height: 'calc(100vh - 140px)' }}>
                {/* Left Sidebar */}
                <div 
                    className={`border-r flex flex-col ${themeClasses.sidebarBg} ${themeClasses.border} h-full relative`}
                    style={{ width: `${leftPanelWidth}px` }}
                >
                    <div className={`p-4 border-b ${themeClasses.border}`}>
                        <div className={`text-sm font-medium mb-3 ${themeClasses.text}`}>
                            {leftPanelWidth < 240 ? 'Categories' : 'Email Categories'}
                        </div>
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
                                    <span className={leftPanelWidth < 220 ? 'text-xs' : ''}>{tab.name}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 space-y-2">
                        <div className={`text-sm font-medium mb-3 ${themeClasses.text}`}>Tools</div>
                        
                        {['Mail Sorter', 'Analytics', 'AI Unsubscribe', 'Email Scheduler', 'Smart Labels', 'Templates'].map((tool, index) => (
                            <button 
                                key={tool}
                                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                                    index === 0 
                                        ? 'bg-blue-100 text-blue-700 font-medium' 
                                        : `${themeClasses.text} hover:bg-opacity-10 hover:bg-gray-500`
                                } ${leftPanelWidth < 220 ? 'text-xs' : ''}`}
                            >
                                {leftPanelWidth < 240 ? tool.split(' ')[0] : tool}
                            </button>
                        ))}
                    </div>

                    <div className={`mt-auto p-4 border-t ${themeClasses.border}`}>
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-600' : 'bg-slate-300'
                            }`}>
                                👤
                            </div>
                            {leftPanelWidth > 220 && (
                                <div>
                                    <div className={`text-sm font-medium ${themeClasses.text}`}>
                                        {gmailData?.user_email?.split('@')[0] || 'User'}
                                    </div>
                                    <button className={`text-xs transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                                        sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors"
                        onMouseDown={() => setIsResizing({ left: true, middle: false })}
                    />
                </div>

                {/* Middle Section - Senders */}
                <div 
                    className={`border-r ${themeClasses.cardBg} ${themeClasses.border} h-full flex flex-col relative`}
                    style={{ width: `${middlePanelWidth}px` }}
                >
                    <div className="p-4 border-b border-inherit">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`font-semibold ${themeClasses.text} ${middlePanelWidth < 300 ? 'text-sm' : ''}`}>
                                {middlePanelWidth < 300 ? 'Senders' : 'Top Senders'}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <select 
                                    value={selectedSender} 
                                    onChange={(e) => {
                                        setSelectedSender(e.target.value);
                                        const newOptions = getSortOrderOptions(e.target.value);
                                        setSortOrder(newOptions[0].value);
                                    }}
                                    className={`px-2 py-1 border rounded text-sm ${themeClasses.input} ${
                                        middlePanelWidth < 320 ? 'text-xs px-1' : ''
                                    }`}
                                >
                                    {emailSortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {middlePanelWidth < 320 ? option.label.split(' ')[0] : option.label}
                                        </option>
                                    ))}
                                </select>
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className={`px-2 py-1 border rounded text-sm ${themeClasses.input} ${
                                        middlePanelWidth < 320 ? 'text-xs px-1' : ''
                                    }`}
                                >
                                    {getSortOrderOptions(selectedSender).map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        <div className="space-y-2">
                            {senders.map((sender: any) => (
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
                                        <span className={`font-medium ${
                                            selectedSenderInList === sender.name 
                                                ? 'text-blue-700' 
                                                : themeClasses.text
                                        } ${middlePanelWidth < 300 ? 'text-sm' : ''}`}>
                                            {truncateText(sender.name, middlePanelWidth, 15)}
                                        </span>
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
                                        <div>{truncateText(sender.email, middlePanelWidth, 25)}</div>
                                        <div>Last: {formatDate(sender.lastEmail)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors"
                        onMouseDown={() => setIsResizing({ left: false, middle: true })}
                    />
                </div>

                {/* Right Section - Email List */}
                <div className={`flex-1 ${themeClasses.cardBg} h-full flex flex-col`}>
                    <div className="p-4 border-b border-inherit">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`font-semibold ${themeClasses.text}`}>
                                {selectedSenderInList} Emails ({sortedEmails.length})
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                    🔄 Refresh
                                </button>
                                <button 
                                    onClick={handleSelectAll}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                    Select All
                                </button>
                                <button 
                                    onClick={handleClearSelection}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${themeClasses.button}`}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        <div className="space-y-2">
                            {sortedEmails.map((email: any) => (
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
                                                {email.subject || 'No Subject'}
                                            </div>
                                            {email.is_unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                                        </div>
                                        <div className={`text-sm mb-1 ${themeClasses.textSecondary}`}>
                                            {email.snippet || 'No preview available'}
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
                        
                        {sortedEmails.length === 0 && selectedSenderInList && (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">📭</div>
                                <p className={themeClasses.textSecondary}>No emails found for {selectedSenderInList}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sync Confirmation Popup */}
            {showSyncPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`${themeClasses.cardBg} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden`}>
                        <div className={`p-6 border-b ${themeClasses.border}`}>
                            <h2 className={`text-xl font-bold ${themeClasses.text}`}>Confirm Sync to Gmail</h2>
                            <p className={`mt-2 ${themeClasses.textSecondary}`}>
                                You have {deletedEmailsData.length} email(s) marked for deletion. Please review the changes below:
                            </p>
                        </div>
                        
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <div className="space-y-4">
                                {deletedEmailsData.map((email, index) => (
                                    <div key={email.id} className={`p-4 rounded border ${themeClasses.border} ${themeClasses.cardBg}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded font-semibold">
                                                        DELETED
                                                    </span>
                                                    <span className={`font-medium ${themeClasses.text}`}>
                                                        #{index + 1}
                                                    </span>
                                                    <span className={`font-semibold ${themeClasses.text}`}>
                                                        {email.subject}
                                                    </span>
                                                    {email.is_unread && (
                                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                                            Unread
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-sm ${themeClasses.textSecondary} mb-2`}>
                                                    <div><strong>From:</strong> {email.sender_name} ({email.sender_email})</div>
                                                    <div><strong>Date:</strong> {formatDate(email.timestamp)}</div>
                                                </div>
                                                <div className={`text-sm ${themeClasses.textSecondary}`}>
                                                    <strong>Preview:</strong> {email.snippet}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUndoFromPopup(email.id)}
                                                className="ml-3 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-200 transition-colors"
                                                disabled={syncInProgress}
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className={`p-6 border-t ${themeClasses.border} flex items-center justify-between`}>
                            <div className={`text-sm ${themeClasses.textSecondary}`}>
                                Total changes to sync: <span className="font-semibold">{deletedEmailsData.length} deletions</span>
                                <div className="mt-1 text-xs">These emails will be synced to your Gmail account.</div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button 
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                    onClick={() => setShowSyncPopup(false)}
                                    disabled={syncInProgress}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-red-700 transition-colors ${
                                        syncInProgress ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    onClick={handleConfirmSync}
                                    disabled={syncInProgress}
                                >
                                    {syncInProgress ? 'Syncing...' : 'Confirm Sync'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            <div className={`border-t px-6 py-2 ${themeClasses.headerBg} ${themeClasses.border}`}>
                <div className={`flex items-center justify-between text-sm ${themeClasses.textSecondary}`}>
                    <div>
                        Connected as: <span className="font-medium">{gmailData?.user_email}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Total: {gmailData?.total_emails_fetched || 0} emails</span>
                        <span>Unread: {gmailData?.emails?.filter((e: any) => e.is_unread).length || 0}</span>
                        <span>Senders: {senders.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}