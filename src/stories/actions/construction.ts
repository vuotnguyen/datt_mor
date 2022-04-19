import AsyncStorage from '@react-native-async-storage/async-storage';
import { String } from 'aws-sdk/clients/batch';
import {
    apiGetConstructioById,
    apiCreateConstruction,
    apiListConstruction,
    apiDeleteConstruction,
    apiUpdateConstruction,
    apiDeleteImageConstruction
} from '../../services/construction';

export const UpdateConstruction = (
    data: any,
    id: string,
    SuccessCallBack: Function,
    ErrorCallback: Function,
    FinallyCallback: Function,
) => {
    return async() => {
        await apiUpdateConstruction(data, id)
            .then(res => {
                SuccessCallBack(res);
            })
            .catch(err => {
                ErrorCallback(err.response.data.detail);
            })
            .finally(() => {
                FinallyCallback();
            });
    };
};
export const ListConstruction = (
    lastKey: string, 
    sortBy: string,
    search: string,
    SuccessCallBack: Function,
    ErrorCallback: Function,
    FinallyCallback: Function,
) => {
    return async() => {
        await apiListConstruction(lastKey,sortBy, search)
            .then(res => {
                SuccessCallBack(res);
            })
            .catch(err => {
                ErrorCallback(err.response.data.detail);
            })
            .finally(() => {
                FinallyCallback();
            });
    };
};
export const createConstruction = (
    data: any,
    SuccessCallBack: Function,
    ErrorCallback: Function,
    FinallyCallback: Function,
) => {
    return async() => {
        await apiCreateConstruction(data)
            .then(res => {
                console.log(res);
                
                SuccessCallBack(res);
            })
            .catch(err => {
                ErrorCallback(err.response.data.detail);
            })
            .finally(() => {
                FinallyCallback();
            });
    };
};
export const deleteConstruction = (
    id: String,
    SuccessCallBack: Function,
    ErrorCallback: Function,
    FinallyCallback: Function,
) => {
    return async() => {
        await apiDeleteConstruction(id)
            .then(res => {
                SuccessCallBack(res);
            })
            .catch(err => {
                ErrorCallback(err.response.data.detail);
            })
            .finally(() => {
                FinallyCallback();
            });
    };
};
export const getConstruction = (
    id: string,
    SuccessCallBack: Function,
    ErrorCallback: Function,
    FinallyCallback: Function,
) => {
    return async() => {
        console.log(await AsyncStorage.getItem('@accessToken'));
        await apiGetConstructioById(id)
            .then(res => {
                SuccessCallBack(res);
            })
            .catch(err => {
                ErrorCallback(err.response.data.detail);
            })
            .finally(() => {
                FinallyCallback();
            });
    };
};
export const deleteImageConstruction = (
    data: any,
    SuccessCallBack: Function,
    ErrorCallback: Function,
    FinallyCallback: Function,
) => {
    return async() => {
       
        await apiDeleteImageConstruction(data)
            .then(res => {
                SuccessCallBack(res);
            })
            .catch(err => {
                ErrorCallback(err.response.data.detail);
            })
            .finally(() => {
                FinallyCallback();
            });
    };
};