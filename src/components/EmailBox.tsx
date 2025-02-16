import React, { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Copy, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { GuerrillaClient } from '../lib/guerrilla';

interface Email {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_timestamp: string;
  mail_read: string;
  mail_date: string;
  mail_body?: string;
}

const EmailBox = () => {
  const [client] = useState(() => new GuerrillaClient());
  const [emailAddress, setEmailAddress] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmailUser, setNewEmailUser] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('sharklasers');
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  const checkEmails = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await client.checkEmail();
      if (!response || !response.list) {
        throw new Error('Invalid response from server');
      }

      setEmails(prevEmails => {
        const emailMap = new Map(prevEmails.map(email => [email.mail_id, email]));
        response.list.forEach(email => emailMap.set(email.mail_id, email));
        return Array.from(emailMap.values())
          .sort((a, b) => Number(b.mail_timestamp) - Number(a.mail_timestamp));
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check emails';
      setError(errorMessage);
      console.error('Failed to check emails:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [client]);

  const handleEmailClick = useCallback(async (email: Email) => {
    setError(null);
    try {
      const fullEmail = await client.fetchEmail(email.mail_id);
      if (!fullEmail) {
        throw new Error('Failed to fetch email content');
      }
      setSelectedEmail({ ...email, mail_body: fullEmail.mail_body });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch email content';
      setError(errorMessage);
      console.error('Failed to fetch email:', error);
    }
  }, [client]);

  const handleCopy = useCallback(() => {
    try {
      navigator.clipboard.writeText(emailAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      setError('Failed to copy email address');
      console.error('Failed to copy:', error);
    }
  }, [emailAddress]);

  const handleRefresh = useCallback(() => {
    checkEmails(true);
  }, [checkEmails]);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailUser.trim()) {
      setError('Email username cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.setEmailUser(newEmailUser);
      if (!response || !response.email_addr) {
        throw new Error('Invalid response from server');
      }
      setEmailAddress(response.email_addr);
      setIsEditing(false);
      await checkEmails(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change email address';
      setError(errorMessage);
      console.error('Failed to change email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainChange = async (domain: string) => {
    setLoading(true);
    setError(null);

    try {
      setSelectedDomain(domain);
      const response = await client.setDomain(domain);
      if (!response || !response.email_addr) {
        throw new Error('Invalid response from server');
      }
      setEmailAddress(response.email_addr);
      setNewEmailUser(response.email_addr.split('@')[0]);
      localStorage.setItem('tempmail_domain', domain);
      await checkEmails(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change email domain';
      setError(errorMessage);
      setSelectedDomain(prevDomain => prevDomain);
      console.error('Failed to change domain:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgetEmail = async () => {
    if (cooldownTime > Date.now()) {
      setError(`Please wait ${Math.ceil((cooldownTime - Date.now()) / 1000)} seconds before generating a new email`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const forgetResult = await client.forgetMe();
      if (!forgetResult) {
        throw new Error('Failed to forget current email');
      }

      const emailUser = client.generateEmailUser();
      const response = await client.setEmailUser(emailUser);
      if (!response || !response.email_addr) {
        throw new Error('Failed to generate new email');
      }

      setEmailAddress(response.email_addr);
      setNewEmailUser(response.email_addr.split('@')[0]);
      setEmails([]);
      setSelectedEmail(null);
      setCooldownTime(Date.now() + 5 * 60 * 1000); // 5 minutes cooldown
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get new email address';
      setError(errorMessage);
      console.error('Failed to get new email:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedDomain = localStorage.getItem('tempmail_domain');
    if (savedDomain) {
      setSelectedDomain(savedDomain);
    }
  }, []);

  useEffect(() => {
    const initializeEmail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await client.getEmailAddress();
        if (!response || !response.email_addr) {
          throw new Error('Invalid response from server');
        }
        setEmailAddress(response.email_addr);
        setNewEmailUser(response.email_addr.split('@')[0]);
        await checkEmails(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize email';
        setError(errorMessage);
        console.error('Failed to initialize email:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeEmail();
  }, [client, checkEmails]);

  useEffect(() => {
    const interval = setInterval(() => checkEmails(false), 15000);
    return () => clearInterval(interval);
  }, [checkEmails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Your temporary email address:</div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:rotate-180"
              title="Refresh emails"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="relative">
              <button 
                onClick={handleCopy} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Copy email address"
              >
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              {showCopied && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg animate-fade-in-out">
                  Copied!
                </div>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Change email address"
              disabled={loading}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleForgetEmail}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${
                cooldownTime > Date.now() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={cooldownTime > Date.now() ? `Wait ${Math.ceil((cooldownTime - Date.now()) / 1000)}s` : "Get new email address"}
              disabled={cooldownTime > Date.now() || loading}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
        {isEditing ? (
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newEmailUser}
                  onChange={(e) => setNewEmailUser(e.target.value)}
                  className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new email username"
                  disabled={loading}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">@{selectedDomain}.com</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="font-mono text-lg mb-2 text-gray-900 dark:text-white">
              {emailAddress}
            </div>
            <div className="inline-block relative w-64">
              <select
                value={selectedDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="block w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm text-gray-900 dark:text-white disabled:opacity-50"
                disabled={loading}
              >
                <option value="sharklasers">@sharklasers.com</option>
                <option value="guerrillamailblock">@guerrillamailblock.com</option>
                <option value="guerrillamail">@guerrillamail.com</option>
                <option value="spam">@spam.me</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </>
        )}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[600px]">
        <div className="border-r dark:border-gray-700 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Mail className="w-12 h-12 mb-2" />
              <p>No emails yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Checking for new emails automatically...</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {emails.map((email) => (
                <button
                  key={email.mail_id}
                  onClick={() => handleEmailClick(email)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedEmail?.mail_id === email.mail_id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium truncate flex-1 text-gray-900 dark:text-white">{email.mail_from}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">{email.mail_date}</div>
                  </div>
                  <div className="text-sm font-medium truncate mb-1 text-gray-800 dark:text-gray-200">{email.mail_subject}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{email.mail_excerpt}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-y-auto bg-white dark:bg-gray-800">
          {selectedEmail ? (
            <div className="p-4">
              <div className="mb-4">
                <div className="font-medium mb-2 text-gray-900 dark:text-white">{selectedEmail.mail_subject}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">From: {selectedEmail.mail_from}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Date: {selectedEmail.mail_date}</div>
              </div>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.mail_body || '' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Mail className="w-12 h-12 mb-2" />
              <p>Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailBox;