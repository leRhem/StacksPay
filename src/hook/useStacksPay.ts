import { useCallback, useRef } from 'react';
import { 
  fetchCallReadOnlyFunction,
  ClarityType,
  type ClarityValue,
  Cl
} from '@stacks/transactions';
import { useStacksConnect } from './useStacksConnect';
import { useToast } from '../context/ToastContext';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../consts';


// HELPER: Convert Clarity Value to JS Value (Adapted from useContract.ts)
function cvToValue(val: ClarityValue): any {
  if (!val) return null;
  const v = val as any;
  switch (v.type) {
    case ClarityType.Int:
    case ClarityType.UInt:
      return Number(v.value);
    case ClarityType.ResponseOk:
      return cvToValue(v.value);
    case ClarityType.ResponseErr:
       return cvToValue(v.value);
    case ClarityType.OptionalNone:
      return null;
    case ClarityType.OptionalSome:
      return cvToValue(v.value);
    case ClarityType.List:
      return v.value.map(cvToValue);
    case ClarityType.Tuple:
      const result: Record<string, any> = {};
      Object.entries(v.value).forEach(([key, value]) => {
        result[key] = cvToValue(value as ClarityValue);
      });
      return result;
    case ClarityType.StringASCII:
    case ClarityType.StringUTF8:
      return v.value;
    default:
      return v && typeof v === 'object' && 'value' in v ? v.value : v;
  }
}

export function useStacksPay() {
    const { network, userAddress } = useStacksConnect();
    const showToast = useToast();
    
    // Use refs for values that change but shouldn't cause function recreation
    const networkRef = useRef(network);
    const userAddressRef = useRef(userAddress);
    const showToastRef = useRef(showToast);
    networkRef.current = network;
    userAddressRef.current = userAddress;
    showToastRef.current = showToast;
    
    const callReadOnly = useCallback(async (functionName: string, functionArgs: ClarityValue[] = []) => {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName,
                functionArgs,
                network: networkRef.current,
                senderAddress: userAddressRef.current || FIXED_CONTRACT_ADDRESS,
            });
            // Convert to JS value immediately
            return cvToValue(result);
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            showToastRef.current({
                type: 'error',
                title: 'Data Fetch Failed',
                message: `Failed to read ${functionName} from contract. Ensure you are connected to the correct network.`,
            });
            return null;
        }
    }, []); // stable — reads latest values from refs

    const getCompany = useCallback(async (companyId: string) => {
        const result = await callReadOnly('get-company', [Cl.stringUtf8(companyId)]);
        if (!result) return null;
        return result;
    }, [callReadOnly]);

    const getCompanyStats = useCallback(async (companyId: string) => {
        const result = await callReadOnly('get-company-stats', [Cl.stringUtf8(companyId)]);
        return result;
    }, [callReadOnly]);

    const getEmployee = useCallback(async (companyId: string, employeeAddress: string) => {
        let principalCV;
        try {
            principalCV = Cl.standardPrincipal(employeeAddress);
        } catch (err) {
            console.warn(`Invalid Stacks principal address: "${employeeAddress}"`, err);
            return null;
        }

        const result = await callReadOnly('get-employee', [
            Cl.stringUtf8(companyId),
            principalCV
        ]);
        return result;
    }, [callReadOnly]);

    const getCurrentPeriod = useCallback(async (companyId: string) => {
        return callReadOnly('get-current-period', [Cl.stringUtf8(companyId)]);
    }, [callReadOnly]);

    const getPeriodClaim = useCallback(async (companyId: string, employeeAddress: string, period: number) => {
        let principalCV;
        try {
            principalCV = Cl.standardPrincipal(employeeAddress);
        } catch (err) {
            console.warn(`Invalid Stacks principal address in getPeriodClaim: "${employeeAddress}"`, err);
            return null;
        }
        return callReadOnly('get-period-claim', [
            Cl.stringUtf8(companyId),
            principalCV,
            Cl.uint(period),
        ]);
    }, [callReadOnly]);

    const getEmployeeStats = useCallback(async (companyId: string, employeeAddress: string) => {
        let principalCV;
        try {
            principalCV = Cl.standardPrincipal(employeeAddress);
        } catch (err) {
            console.warn(`Invalid Stacks principal address in getEmployeeStats: "${employeeAddress}"`, err);
            return null;
        }
        return callReadOnly('get-employee-stats', [
            Cl.stringUtf8(companyId),
            principalCV,
        ]);
    }, [callReadOnly]);

    const canAdvancePeriod = useCallback(async (companyId: string) => {
        return callReadOnly('can-advance-period', [Cl.stringUtf8(companyId)]);
    }, [callReadOnly]);

    const getCompanyBalance = useCallback(async (companyId: string) => {
        return callReadOnly('get-company-balance', [Cl.stringUtf8(companyId)]);
    }, [callReadOnly]);

    return {
        getCompany,
        getCompanyStats,
        getEmployee,
        getCurrentPeriod,
        getPeriodClaim,
        getEmployeeStats,
        canAdvancePeriod,
        getCompanyBalance,
    };
}
