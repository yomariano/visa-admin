// Types for our tables
export interface PermitRule {
  id: number;
  permit_type: string;
  title: string;
  rule: string;
  category: string;
  is_required: boolean;
  updated_at: string;
}

export interface RequiredDocument {
  id: number;
  permit_type: string;
  document_name: string;
  required_for: 'employee' | 'employer' | 'both';
  is_mandatory: boolean;
  condition?: string;
  updated_at: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  validation_rules: Record<string, unknown>;
} 