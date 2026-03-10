import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { UserData, ParentData, ChildcareAllowanceModel, DistributionBlock, BirthCondition } from '@/types';
import { FLAT_RATE_CONFIG } from '@/data/constants';

const STORAGE_KEY = 'karenz-user-data';

const DEFAULT_PARENT: ParentData = {
  monthlyNetIncome: 0,
  hasWorked182Days: false,
  employmentStatus: 'employed',
};

const DEFAULT_USER_DATA: UserData = {
  dueDate: '',
  parent1: { ...DEFAULT_PARENT },
  parent2: { ...DEFAULT_PARENT },
  selectedModel: {
    type: 'flatRate',
    chosenDurationDays: FLAT_RATE_CONFIG.minDaysBothParents,
  },
  distributionPlan: [],
  birthConditions: [],
};

// Migration helper for old data format
interface OldParentData {
  name?: string;
  monthlySalary?: number;
  monthlyNetIncome?: number;
  hasWorked182Days: boolean;
  employmentStatus?: ParentData['employmentStatus'];
  dailyUnemploymentBenefit?: number;
}

function migrateParentData(parent: OldParentData | ParentData): ParentData {
  const oldParent = parent as OldParentData;
  return {
    name: parent.name,
    // Migrate old monthlySalary to monthlyNetIncome (assume ~70% net of gross as approximation)
    monthlyNetIncome: parent.monthlyNetIncome ?? (oldParent.monthlySalary ? oldParent.monthlySalary * 0.7 : 0),
    hasWorked182Days: parent.hasWorked182Days,
    employmentStatus: parent.employmentStatus ?? 'employed',
    dailyUnemploymentBenefit: parent.dailyUnemploymentBenefit,
  };
}

export function useUserData() {
  const [userData, setUserData, clearUserData] = useLocalStorage<UserData>(
    STORAGE_KEY,
    DEFAULT_USER_DATA
  );

  // Migrate old data format on first load
  useEffect(() => {
    const oldParent1 = userData.parent1 as OldParentData;
    const oldParent2 = userData.parent2 as OldParentData;
    
    // Check if migration is needed (old format had monthlySalary or missing employmentStatus)
    const needsMigration = 
      'monthlySalary' in oldParent1 || 
      'monthlySalary' in oldParent2 ||
      !oldParent1.employmentStatus ||
      !oldParent2.employmentStatus;
      
    if (needsMigration) {
      setUserData((prev) => ({
        ...prev,
        parent1: migrateParentData(prev.parent1),
        parent2: migrateParentData(prev.parent2),
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDueDate = useCallback(
    (dueDate: string) => {
      setUserData((prev) => ({ ...prev, dueDate }));
    },
    [setUserData]
  );

  const updateParent1 = useCallback(
    (parent1: ParentData) => {
      setUserData((prev) => ({ ...prev, parent1 }));
    },
    [setUserData]
  );

  const updateParent2 = useCallback(
    (parent2: ParentData) => {
      setUserData((prev) => ({ ...prev, parent2 }));
    },
    [setUserData]
  );

  const updateSelectedModel = useCallback(
    (selectedModel: ChildcareAllowanceModel) => {
      setUserData((prev) => ({ ...prev, selectedModel }));
    },
    [setUserData]
  );

  const updateDistributionPlan = useCallback(
    (distributionPlan: DistributionBlock[]) => {
      setUserData((prev) => ({ ...prev, distributionPlan }));
    },
    [setUserData]
  );

  const updateBirthConditions = useCallback(
    (birthConditions: BirthCondition[]) => {
      setUserData((prev) => ({ ...prev, birthConditions }));
    },
    [setUserData]
  );

  const resetData = useCallback(() => {
    clearUserData();
  }, [clearUserData]);

  // Check if at least one parent will take leave (for determining max duration)
  const isBothParents = userData.distributionPlan.some((b) => b.parent === 'parent2');

  // Check if data is complete enough for calculations
  // Note: For mothers without employment (notEmployed), income can be 0
  const isDataComplete =
    userData.dueDate !== '' &&
    (userData.parent1.monthlyNetIncome > 0 || 
     userData.parent2.monthlyNetIncome > 0 ||
     userData.parent1.employmentStatus === 'notEmployed' ||
     userData.parent1.employmentStatus === 'marginallyEmployed');

  return {
    userData,
    updateDueDate,
    updateParent1,
    updateParent2,
    updateSelectedModel,
    updateDistributionPlan,
    updateBirthConditions,
    resetData,
    isBothParents,
    isDataComplete,
  };
}
