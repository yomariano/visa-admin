'use client';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PermitRule, RequiredDocument } from '@/lib/types';
import {
  getPermitRules,
  getRequiredDocuments,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
  createPermitRule,
  updatePermitRule,
  deletePermitRule
} from '@/lib/database-actions';
import { useAuth } from '@/components/auth-provider';
import { LoginPage, UnauthorizedPage } from '@/components/login';

function AdminInterface() {
  const [activeTab, setActiveTab] = useState<'permit-rules' | 'required-documents'>('permit-rules');
  const [permitRules, setPermitRules] = useState<PermitRule[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [permitTypes, setPermitTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [showPermitRuleDialog, setShowPermitRuleDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [editingPermitRule, setEditingPermitRule] = useState<PermitRule | null>(null);
  const [editingDocument, setEditingDocument] = useState<RequiredDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'permit-rule' | 'document'; id: number } | null>(null);

  // Loading states for operations
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isDeletingRule, setIsDeletingRule] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const [isCloningRule, setIsCloningRule] = useState(false);

  const { user, signOut } = useAuth();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🚀 loadData() called - starting data fetch...');
    setLoading(true);
    try {
      console.log('📞 Fetching data from API...');

      const [rules, documents] = await Promise.all([
        getPermitRules(),
        getRequiredDocuments()
      ]);

      console.log('📋 Received permit rules:', rules);
      console.log('📋 Received required documents:', documents);
      console.log('📊 Rules count:', rules?.length || 0);
      console.log('📊 Documents count:', documents?.length || 0);
      
      // Log specific documents for debugging
      if (documents && documents.length > 0) {
        console.log('📄 First few documents:');
        documents.slice(0, 3).forEach((doc: RequiredDocument, index: number) => {
          console.log(`  ${index + 1}. ID: ${doc.id}, Name: "${doc.document_name}", Type: ${doc.permit_type}, Active: ${doc.is_active}`);
        });
        
        // Check for signature-related documents
        const signatureDocs = documents.filter((doc: RequiredDocument) => 
          doc.document_name.toLowerCase().includes('signature')
        );
        console.log('📝 Signature-related documents found:', signatureDocs.length);
        if (signatureDocs.length > 0) {
          signatureDocs.forEach((doc: RequiredDocument) => {
            console.log(`  - ID: ${doc.id}, Name: "${doc.document_name}", Active: ${doc.is_active}`);
          });
        }
      }
      
      setPermitRules(rules || []);
      setRequiredDocuments(documents || []);
      
      // Extract unique permit types from existing permit rules and required documents
      const permitTypesFromRules = rules?.map((rule: PermitRule) => rule.permit_type).filter(Boolean) || [];
      const permitTypesFromDocs = documents?.map((doc: RequiredDocument) => doc.permit_type).filter(Boolean) || [];
      const allPermitTypes = [...permitTypesFromRules, ...permitTypesFromDocs];
      const uniquePermitTypes = Array.from(new Set(allPermitTypes)).sort();
      setPermitTypes(uniquePermitTypes as string[]);
      
      // Extract unique categories from existing permit rules
      const uniqueCategories = Array.from(new Set(
        rules?.map((rule: PermitRule) => rule.category).filter(Boolean) || []
      )).sort();
      setCategories(uniqueCategories as string[]);
      
      console.log('📋 Extracted permit types:', uniquePermitTypes);
      console.log('📋 Extracted categories:', uniqueCategories);
      console.log('📊 Categories count:', uniqueCategories.length);
      console.log('📋 Raw categories from rules:', rules?.map((rule: PermitRule) => rule.category) || []);
      
      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('💥 Error in loadData:', error);
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      console.log('🏁 loadData() completed');
    }
  };

  // Permit Rule handlers
  const handlePermitRuleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingRule(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Get category from either the select dropdown or the custom input
    const selectedCategory = formData.get('category') as string;
    const customCategory = formData.get('custom_category') as string;
    const finalCategory = customCategory?.trim() || selectedCategory;
    
    const data = {
      permit_type: formData.get('permit_type') as string,
      title: formData.get('title') as string,
      rule: formData.get('rule') as string,
      category: finalCategory,
      is_required: formData.get('is_required') === 'true',
    };

    // Validate that we have a category
    if (!data.category) {
      toast.error('Please select or enter a category');
      setIsSubmittingRule(false);
      return;
    }

    try {
      let result;
      if (editingPermitRule) {
        console.log('🔄 Updating permit rule server-side:', editingPermitRule.id, data);
        result = await updatePermitRule(editingPermitRule.id, data);
        console.log('📝 Update result:', result);
        toast.success('Permit rule updated successfully');
      } else {
        console.log('➕ Creating permit rule server-side:', data);
        result = await createPermitRule(data);
        console.log('📝 Create result:', result);
        toast.success('Permit rule created successfully');
      }
      
      console.log('✅ Permit rule operation completed successfully');
      setShowPermitRuleDialog(false);
      setEditingPermitRule(null);
      await loadData(); // Reload data
    } catch (error) {
      toast.error('Failed to save permit rule');
      console.error('Error saving permit rule:', error);
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleDeletePermitRule = async (id: number) => {
    setIsDeletingRule(true);
    try {
      console.log('🗑️ Deleting permit rule server-side:', id);
      const success = await deletePermitRule(id);
      
      if (success) {
        toast.success('Permit rule deleted successfully');
        setDeleteConfirm(null);
        await loadData(); // Reload data
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      toast.error('Failed to delete permit rule');
      console.error('Error deleting permit rule:', error);
    } finally {
      setIsDeletingRule(false);
    }
  };

  const handleClonePermitRule = async (id: number) => {
    setIsCloningRule(true);
    try {
      console.log('📋 Cloning permit rule server-side:', id);
      
      // First, find the existing rule in our current data
      const existing = permitRules.find(rule => rule.id === id);
      if (!existing) {
        throw new Error('Rule not found for cloning');
      }
      
      // Create new rule data without ID and timestamp
      const cloneData = {
        permit_type: existing.permit_type,
        title: existing.title,
        rule: existing.rule,
        category: existing.category,
        is_required: existing.is_required,
      };
      
      const result = await createPermitRule(cloneData);
      if (result) {
        toast.success('Permit rule cloned successfully');
        await loadData(); // Reload data
      } else {
        throw new Error('Clone operation failed');
      }
    } catch (error) {
      toast.error('Failed to clone permit rule');
      console.error('Error cloning permit rule:', error);
    } finally {
      setIsCloningRule(false);
    }
  };

  // Document handlers
  const handleDocumentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingDocument(true);
    
    const formData = new FormData(e.currentTarget);
    
    const data = {
      permit_type: formData.get('permit_type') as string,
      document_name: formData.get('document_name') as string,
      required_for: formData.get('required_for') as 'employee' | 'employer' | 'both',
      is_mandatory: formData.get('is_mandatory') === 'true',
      condition: formData.get('condition') as string || undefined,
      description: formData.get('description') as string || undefined,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
      validation_rules: {},
    };

    console.log('🚀 Document submission started');
    console.log('📋 Form data being submitted:', data);
    console.log('📊 Data validation check:');
    console.log('  - permit_type:', data.permit_type, typeof data.permit_type);
    console.log('  - document_name:', data.document_name, typeof data.document_name);
    console.log('  - required_for:', data.required_for, typeof data.required_for);
    console.log('  - is_mandatory:', data.is_mandatory, typeof data.is_mandatory);
    console.log('  - is_active:', data.is_active, typeof data.is_active);
    console.log('  - sort_order:', data.sort_order, typeof data.sort_order);

    try {
      let result;
      if (editingDocument) {
        console.log('🔄 Updating existing document with ID:', editingDocument.id);
        result = await updateRequiredDocument(editingDocument.id, data);
        console.log('📝 Update result:', result);
        toast.success('Required document updated successfully');
      } else {
        console.log('➕ Creating new document');
        result = await createRequiredDocument(data);
        console.log('📝 Create result:', result);
        toast.success('Required document created successfully');
      }
      
      console.log('✅ Document operation completed successfully');
      console.log('🔄 Closing dialog and refreshing data...');
      
      setShowDocumentDialog(false);
      setEditingDocument(null);
      await loadData();
      
      console.log('🏁 Document submission process completed');
    } catch (error) {
      console.error('💥 Error in document submission:', error);
      console.error('📊 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data: data
      });
      toast.error('Failed to save required document');
      console.error('Error saving required document:', error);
    } finally {
      setIsSubmittingDocument(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    setIsDeletingDocument(true);
    try {
      await deleteRequiredDocument(id);
      toast.success('Required document deleted successfully');
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      toast.error('Failed to delete required document');
      console.error('Error deleting required document:', error);
    } finally {
      setIsDeletingDocument(false);
    }
  };

  // Check if any operation is in progress
  const isAnyOperationInProgress = loading || isSubmittingRule || isSubmittingDocument || 
    isDeletingRule || isDeletingDocument || isCloningRule;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      
      {/* Loading overlay when any operation is in progress */}
      {isAnyOperationInProgress && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg border">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">
              {loading && 'Loading data...'}
              {isSubmittingRule && (editingPermitRule ? 'Updating permit rule...' : 'Creating permit rule...')}
              {isSubmittingDocument && (editingDocument ? 'Updating document...' : 'Creating document...')}
              {isDeletingRule && 'Deleting permit rule...'}
              {isDeletingDocument && 'Deleting document...'}
              {isCloningRule && 'Cloning permit rule...'}
            </span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visa Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage permit rules and required documents</p>
            {process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true' && (
              <div className="mt-2 px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm rounded-md inline-block">
                🚧 DEV MODE: Authentication bypassed
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{user?.email}</strong>
              {process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true' && (
                <span className="ml-2 text-yellow-600 font-medium">(Dev User)</span>
              )}
            </span>
            <Button variant="outline" onClick={signOut} disabled={isAnyOperationInProgress}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('permit-rules')}
                disabled={isAnyOperationInProgress}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'permit-rules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${isAnyOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Permit Rules ({permitRules.length})
              </button>
              <button
                onClick={() => setActiveTab('required-documents')}
                disabled={isAnyOperationInProgress}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'required-documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${isAnyOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Required Documents ({requiredDocuments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'permit-rules' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Permit Rules</CardTitle>
              <Dialog open={showPermitRuleDialog} onOpenChange={(open) => !isAnyOperationInProgress && setShowPermitRuleDialog(open)}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setEditingPermitRule(null)} 
                    disabled={isAnyOperationInProgress}
                  >
                    Add New Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingPermitRule ? 'Edit' : 'Add'} Permit Rule</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePermitRuleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="permit_type">Permit Type</Label>
                        <select
                          id="permit_type"
                          name="permit_type"
                          defaultValue={editingPermitRule?.permit_type || ''}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={isSubmittingRule}
                          required
                        >
                          <option value="">Select a permit type...</option>
                          {permitTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          defaultValue={editingPermitRule?.category || ''}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={isSubmittingRule}
                          onChange={(e) => {
                            const customInput = document.getElementById('custom_category') as HTMLInputElement;
                            if (e.target.value && customInput) {
                              customInput.value = '';
                            }
                          }}
                        >
                          <option value="">Select a category...</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <div className="mt-1 text-xs text-gray-500">
                          Available categories: {categories.length > 0 ? categories.join(', ') : 'None'}
                        </div>
                        <div className="mt-2">
                          <Label htmlFor="custom_category" className="text-xs font-medium text-blue-600">Or create a new category:</Label>
                          <input
                            id="custom_category"
                            name="custom_category"
                            className="w-full p-2 border border-blue-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Type a new category name..."
                            disabled={isSubmittingRule}
                            onInput={(e) => {
                              const customInput = e.currentTarget;
                              const selectInput = document.getElementById('category') as HTMLSelectElement;
                              if (customInput.value.trim()) {
                                selectInput.value = '';
                                selectInput.required = false;
                              } else {
                                selectInput.required = true;
                              }
                            }}
                          />
                          <div className="mt-1 text-xs text-blue-500">
                            💡 Tip: Enter a new category name to create it automatically
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingPermitRule?.title || ''}
                        disabled={isSubmittingRule}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rule">Rule</Label>
                      <Textarea
                        id="rule"
                        name="rule"
                        defaultValue={editingPermitRule?.rule || ''}
                        disabled={isSubmittingRule}
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="is_required">Is Required</Label>
                      <select
                        id="is_required"
                        name="is_required"
                        defaultValue={editingPermitRule?.is_required ? 'true' : 'false'}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={isSubmittingRule}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowPermitRuleDialog(false)}
                        disabled={isSubmittingRule}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmittingRule}
                      >
                        {isSubmittingRule ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{editingPermitRule ? 'Updating...' : 'Creating...'}</span>
                          </div>
                        ) : (
                          editingPermitRule ? 'Update' : 'Create'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Permit Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permitRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.id}</TableCell>
                      <TableCell>{rule.permit_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{rule.title}</TableCell>
                      <TableCell>{rule.category}</TableCell>
                      <TableCell>{rule.is_required ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAnyOperationInProgress}
                            onClick={() => {
                              setEditingPermitRule(rule);
                              setShowPermitRuleDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isAnyOperationInProgress}
                            onClick={() => setDeleteConfirm({ type: 'permit-rule', id: rule.id })}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAnyOperationInProgress || isCloningRule}
                            onClick={() => handleClonePermitRule(rule.id)}
                          >
                            {isCloningRule ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                <span>Cloning...</span>
                              </div>
                            ) : (
                              'Clone'
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'required-documents' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Required Documents</CardTitle>
              <Dialog open={showDocumentDialog} onOpenChange={(open) => !isAnyOperationInProgress && setShowDocumentDialog(open)}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setEditingDocument(null)}
                    disabled={isAnyOperationInProgress}
                  >
                    Add New Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingDocument ? 'Edit' : 'Add'} Required Document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDocumentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="permit_type">Permit Type</Label>
                        <select
                          id="permit_type"
                          name="permit_type"
                          defaultValue={editingDocument?.permit_type || ''}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={isSubmittingDocument}
                          required
                        >
                          <option value="">Select a permit type...</option>
                          {permitTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="required_for">Required For</Label>
                        <select
                          id="required_for"
                          name="required_for"
                          defaultValue={editingDocument?.required_for || 'employee'}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={isSubmittingDocument}
                        >
                          <option value="employee">Employee</option>
                          <option value="employer">Employer</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="document_name">Document Name</Label>
                      <Input
                        id="document_name"
                        name="document_name"
                        defaultValue={editingDocument?.document_name || ''}
                        disabled={isSubmittingDocument}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingDocument?.description || ''}
                        disabled={isSubmittingDocument}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Textarea
                        id="condition"
                        name="condition"
                        defaultValue={editingDocument?.condition || ''}
                        disabled={isSubmittingDocument}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input
                          id="sort_order"
                          name="sort_order"
                          type="number"
                          defaultValue={editingDocument?.sort_order || 0}
                          disabled={isSubmittingDocument}
                        />
                      </div>
                      <div>
                        <Label htmlFor="is_mandatory">Is Mandatory</Label>
                        <select
                          id="is_mandatory"
                          name="is_mandatory"
                          defaultValue={editingDocument?.is_mandatory ? 'true' : 'false'}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={isSubmittingDocument}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="is_active">Is Active</Label>
                        <select
                          id="is_active"
                          name="is_active"
                          defaultValue={editingDocument?.is_active ? 'true' : 'false'}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={isSubmittingDocument}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowDocumentDialog(false)}
                        disabled={isSubmittingDocument}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmittingDocument}
                      >
                        {isSubmittingDocument ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{editingDocument ? 'Updating...' : 'Creating...'}</span>
                          </div>
                        ) : (
                          editingDocument ? 'Update' : 'Create'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Permit Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Required For</TableHead>
                    <TableHead>Mandatory</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requiredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.id}</TableCell>
                      <TableCell>{doc.permit_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{doc.document_name}</TableCell>
                      <TableCell>{doc.required_for}</TableCell>
                      <TableCell>{doc.is_mandatory ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{doc.is_active ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{doc.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAnyOperationInProgress}
                            onClick={() => {
                              setEditingDocument(doc);
                              setShowDocumentDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isAnyOperationInProgress}
                            onClick={() => setDeleteConfirm({ type: 'document', id: doc.id })}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !isAnyOperationInProgress && !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the{' '}
                {deleteConfirm?.type === 'permit-rule' ? 'permit rule' : 'required document'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingRule || isDeletingDocument}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeletingRule || isDeletingDocument}
                onClick={() => {
                  if (deleteConfirm) {
                    if (deleteConfirm.type === 'permit-rule') {
                      handleDeletePermitRule(deleteConfirm.id);
                    } else {
                      handleDeleteDocument(deleteConfirm.id);
                    }
                  }
                }}
              >
                {(isDeletingRule || isDeletingDocument) ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  return <AdminInterface />;
}
