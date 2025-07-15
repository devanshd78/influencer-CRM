'use client'

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Feature {
  key: string;
  value: number;
}

interface SubscriptionPlan {
  _id: string;
  role: string;
  name: string;
  monthlyCost: number;
  features: Feature[];
  planId: string;
  createdAt: string;
}

type Role = 'Brand' | 'Influencer';

const SubscriptionsPage: NextPage = () => {
  const [brandPlans, setBrandPlans] = useState<SubscriptionPlan[]>([]);
  const [influencerPlans, setInfluencerPlans] = useState<SubscriptionPlan[]>([]);
  const [activeRole, setActiveRole] = useState<Role>('Brand');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [editedCost, setEditedCost] = useState<string>('');
  const [editedFeatures, setEditedFeatures] = useState<Record<string, string>>({});

  // Fetch plans by role
  const fetchPlans = async (
    role: Role,
    setter: React.Dispatch<React.SetStateAction<SubscriptionPlan[]>>
  ) => {
    try {
      const response = await post<{ message: string; plans: SubscriptionPlan[] }>(
        '/subscription/list',
        { role }
      );
      setter(response.plans);
    } catch (err) {
      console.error(`Error fetching ${role} plans:`, err);
      setError(`Failed to load ${role} plans.`);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPlans('Brand', setBrandPlans),
      fetchPlans('Influencer', setInfluencerPlans),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading plans...</p>;
  if (error)   return <p className="text-red-600">{error}</p>;

  const plans = activeRole === 'Brand' ? brandPlans : influencerPlans;
  const featureKeys = Array.from(
    new Set(plans.flatMap(p => p.features.map(f => f.key)))
  );

  const startEditing = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan._id);
    setEditedName(plan.name);
    setEditedCost(plan.monthlyCost.toString());
    const initialFeatures: Record<string, string> = {};
    plan.features.forEach(f => {
      initialFeatures[f.key] = String(f.value);
    });
    setEditedFeatures(initialFeatures);
  };

  const cancelEditing = () => {
    setEditingPlanId(null);
    setEditedName('');
    setEditedCost('');
    setEditedFeatures({});
  };

  const saveEditing = async (plan: SubscriptionPlan) => {
    try {
      const payload = {
        planId: plan.planId,
        name: editedName.trim(),
        monthlyCost: parseFloat(editedCost),
        features: featureKeys.map(key => ({
          key,
          value: Number(editedFeatures[key] ?? 0),
        })),
      };
      await post('/subscription/update', payload);
      // refetch only the active role
      await fetchPlans(activeRole, activeRole === 'Brand' ? setBrandPlans : setInfluencerPlans);
      cancelEditing();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Subscription Plans</h1>

      <Tabs
        value={activeRole}
        onValueChange={(v) => setActiveRole(v as Role)}
        className="bg-white rounded-lg shadow p-2 w-max"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="Brand" className="text-sm">Brand</TabsTrigger>
          <TabsTrigger value="Influencer" className="text-sm">Influencer</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Cost</TableHead>
              {featureKeys.map(key => (
                <TableHead
                  key={key}
                  className="text-center capitalize text-sm"
                >
                  {key.replace(/_/g, ' ')}
                </TableHead>
              ))}
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map(plan => {
              const isEditing = editingPlanId === plan._id;
              return (
                <TableRow key={plan._id}>
                  <TableCell className="font-medium">
                    {isEditing ? (
                      <Input
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)}
                        className="w-32 mx-auto"
                      />
                    ) : (
                      plan.name
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isEditing ? (
                      <Input
                        value={editedCost}
                        onChange={e => setEditedCost(e.target.value)}
                        className="w-24 mx-auto"
                      />
                    ) : (
                      `$${plan.monthlyCost.toFixed(2)}`
                    )}
                  </TableCell>
                  {featureKeys.map(key => (
                    <TableCell key={key} className="text-center">
                      {isEditing ? (
                        <Input
                          value={editedFeatures[key] ?? ''}
                          onChange={e =>
                            setEditedFeatures(prev => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-16 mx-auto"
                        />
                      ) : (
                        plan.features.find(f => f.key === key)?.value ?? '-'
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="flex justify-center items-center">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveEditing(plan)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(plan)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
