import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND,
});

export const postGetRepo = async (url: string, option: any) => {    
    try {
        const response = await axiosInstance.post(url, option);

        if (response.status === 200) return response.data;
        if (response.status === 404) return response.data;
    } catch (error:any) {
        console.error("Error retrieving data.");
        return error.response.data
    }
}

export const getStatus = async(url:string) => {
    try {
        const response = await axiosInstance.get(url);

        if (response.status === 200) return response.data;
        if (response.status === 404) return response.data;
    } catch (error: any) {
        console.error("Error retrieving data.");
        return error.response.data
    }
}