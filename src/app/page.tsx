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
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument
} from '@/lib/database-actions';
import { useAuth } from '@/components/auth-provider';
import { LoginPage, UnauthorizedPage } from '@/components/login';
import { supabase } from '@/lib/supabase';

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

  const { user, signOut } = useAuth();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🚀 loadData() called - starting data fetch...');
    setLoading(true);
    try {
      console.log('📞 Fetching data directly using Supabase client on the client side...');

      const [
        { data: rules, error: rulesError }, 
        { data: documents, error: docsError },
        { data: permitTypesData, error: permitTypesError },
        { data: categoriesData, error: categoriesError }
      ] = await Promise.all([
        supabase
          .from('permit_rules')
          .select('*')
          .order('id', { ascending: false }),
        supabase
          .from('required_documents')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('id', { ascending: false }),
        supabase
          .from('permit_types')
          .select('permit_type')
          .order('permit_type', { ascending: true }),
        supabase
          .from('permit_rules')
          .select('category')
          .not('category', 'is', null)
          .order('category', { ascending: true })
      ]);

      if (rulesError) {
        console.error('❌ Error fetching permit rules:', rulesError);
        throw rulesError;
      }

      if (docsError) {
        console.error('❌ Error fetching required documents:', docsError);
        throw docsError;
      }

      if (permitTypesError) {
        console.error('❌ Error fetching permit types:', permitTypesError);
        // Don't throw, just log the error and continue
      }

      if (categoriesError) {
        console.error('❌ Error fetching categories:', categoriesError);
        // Don't throw, just log the error and continue
      }

      console.log('📋 Received permit rules:', rules);
      console.log('📋 Received required documents:', documents);
      console.log('📋 Received permit types:', permitTypesData);
      console.log('📋 Received categories:', categoriesData);
      console.log('📊 Rules count:', rules?.length || 0);
      console.log('📊 Documents count:', documents?.length || 0);
      
      setPermitRules(rules);
      setRequiredDocuments(documents);
      
      // Extract permit types
      const uniquePermitTypes = permitTypesData?.map(item => item.permit_type) || [];
      setPermitTypes(uniquePermitTypes);
      
      // Extract unique categories from existing permit rules
      const uniqueCategories = Array.from(new Set(
        categoriesData?.map(item => item.category).filter(Boolean) || []
      ));
      setCategories(uniqueCategories);
      
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
    const formData = new FormData(e.currentTarget);
    
    const data = {
      permit_type: formData.get('permit_type') as string,
      title: formData.get('title') as string,
      rule: formData.get('rule') as string,
      category: formData.get('category') as string,
      is_required: formData.get('is_required') === 'true',
    };

    try {
      if (editingPermitRule) {
        console.log('🔄 Updating permit rule client-side:', editingPermitRule.id, data);
        const { error } = await supabase
          .from('permit_rules')
          .update(data)
          .eq('id', editingPermitRule.id);
        
        if (error) throw error;
        toast.success('Permit rule updated successfully');
      } else {
        console.log('➕ Creating permit rule client-side:', data);
        const { error } = await supabase
          .from('permit_rules')
          .insert([data]);
        
        if (error) throw error;
        toast.success('Permit rule created successfully');
      }
      setShowPermitRuleDialog(false);
      setEditingPermitRule(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save permit rule');
      console.error('Error saving permit rule:', error);
    }
  };

  const handleDeletePermitRule = async (id: number) => {
    try {
      console.log('🗑️ Deleting permit rule client-side:', id);
      const { error } = await supabase
        .from('permit_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Permit rule deleted successfully');
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete permit rule');
      console.error('Error deleting permit rule:', error);
    }
  };

  const handleClonePermitRule = async (id: number) => {
    try {
      console.log('📋 Cloning permit rule client-side:', id);
      
      // First, fetch the existing rule
      const { data: existing, error: fetchError } = await supabase
        .from('permit_rules')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Remove ID and timestamp fields, then insert
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, created_at: _created, updated_at: _updated, ...cloneData } = existing;
      
      const { error: insertError } = await supabase
        .from('permit_rules')
        .insert([cloneData]);
      
      if (insertError) throw insertError;
      toast.success('Permit rule cloned successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to clone permit rule');
      console.error('Error cloning permit rule:', error);
    }
  };

  // Document handlers
  const handleDocumentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    try {
      if (editingDocument) {
        await updateRequiredDocument(editingDocument.id, data);
        toast.success('Required document updated successfully');
      } else {
        await createRequiredDocument(data);
        toast.success('Required document created successfully');
      }
      setShowDocumentDialog(false);
      setEditingDocument(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save required document');
      console.error('Error saving required document:', error);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await deleteRequiredDocument(id);
      toast.success('Required document deleted successfully');
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete required document');
      console.error('Error deleting required document:', error);
    }
  };

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
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visa Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage permit rules and required documents</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{user?.email}</strong>
            </span>
            <Button variant="outline" onClick={signOut}>
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
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permit-rules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permit Rules ({permitRules.length})
              </button>
              <button
                onClick={() => setActiveTab('required-documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'required-documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
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
              <Dialog open={showPermitRuleDialog} onOpenChange={setShowPermitRuleDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingPermitRule(null)}>Add New Rule</Button>
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
                        <input
                          id="category"
                          name="category"
                          list="categories"
                          defaultValue={editingPermitRule?.category || ''}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Enter or select category..."
                          required
                        />
                        <datalist id="categories">
                          {categories.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingPermitRule?.title || ''}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rule">Rule</Label>
                      <Textarea
                        id="rule"
                        name="rule"
                        defaultValue={editingPermitRule?.rule || ''}
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
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowPermitRuleDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingPermitRule ? 'Update' : 'Create'}
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
                            onClick={() => setDeleteConfirm({ type: 'permit-rule', id: rule.id })}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClonePermitRule(rule.id)}
                          >
                            Clone
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
              <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingDocument(null)}>Add New Document</Button>
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
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingDocument?.description || ''}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Textarea
                        id="condition"
                        name="condition"
                        defaultValue={editingDocument?.condition || ''}
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
                        />
                      </div>
                      <div>
                        <Label htmlFor="is_mandatory">Is Mandatory</Label>
                        <select
                          id="is_mandatory"
                          name="is_mandatory"
                          defaultValue={editingDocument?.is_mandatory ? 'true' : 'false'}
                          className="w-full p-2 border border-gray-300 rounded-md"
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
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowDocumentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDocument ? 'Update' : 'Create'}
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
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the{' '}
                {deleteConfirm?.type === 'permit-rule' ? 'permit rule' : 'required document'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
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
                Delete
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
