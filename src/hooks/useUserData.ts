import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { UserData, ParentData, ChildcareAllowanceModel, DistributionBlock, BirthCondition } from '@/types';
import { FLAT_RATE_CONFIG } from '@/data/constants';

const STORAGE_KEY = 'karenz-user-data';

const DEFAULT_PARENT: ParentData = {
  monthlySalary: 0,
  hasWorked182Days: false,
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

export function useUserData() {
  const [userData, setUserData, clearUserData] = useLocalStorage<UserData>(
    STORAGE_KEY,
    DEFAULT_USER_DATA
  );

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
  const isDataComplete =
    userData.dueDate !== '' &&
    (userData.parent1.monthlySalary > 0 || userData.parent2.monthlySalary > 0);

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
