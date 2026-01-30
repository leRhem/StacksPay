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
    
    const callReadOnly = async (functionName: string, functionArgs: ClarityValue[] = []) => {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName,
                functionArgs,
                network,
                senderAddress: userAddress || FIXED_CONTRACT_ADDRESS,
            });
            // Convert to JS value immediately
            return cvToValue(result);
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            showToast({
                type: 'error',
                title: 'Data Fetch Failed',
                message: `Failed to read ${functionName} from contract. Ensure you are connected to the correct network.`,
            });
            return null;
        }
    };

    const getCompany = async (companyId: string) => {
        const result = await callReadOnly('get-company', [Cl.stringUtf8(companyId)]);
        if (!result) return null;
        
        // Map fields to camelCase if preferred, or keep as is.
        // The contract returns: { name, owner, 'total-balance', 'active-employees-count', ... }
        return result;
    };

    const getCompanyStats = async (companyId: string) => {
        const result = await callReadOnly('get-company-stats', [Cl.stringUtf8(companyId)]);
        return result;
    };

    return {
        getCompany,
        getCompanyStats
    };
}
