import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

// Get all files belong to the current user
async function getFile(session) {
    if (session) {
        let data = await axios.post(`${process.env.NEXT_PUBLIC_NODE_URL}/api/file/list`, {}, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${session?.account.id_token}`,
            },
        }).then((res) => {
            return res.data.message

        }).catch(function (error) {
            console.log('Error', error);
        });
        return data;
    }
}


// Delete file by user session and key
async function deleteFile(session, key) {
    if (session) {
        let data = await axios.post(`${process.env.NEXT_PUBLIC_NODE_URL}/api/file/delete`, { key }, {
            headers: {
                'Authorization': `Bearer ${session?.account.id_token}`,
            },
        }).then((res) => {
            toast.success('File Removed', {
                position: "bottom-right",
                autoClose: 2000,
            });
            return true
        }).catch(function (error) {
            console.log('Error', error);
        });
        return data;
    }
}

// Upload new file to the server
function postFile(session, file, selValue) {
    const formData = new FormData();
    formData.append("file", file)
    formData.append("private", selValue);


    let data = axios.post(`${process.env.NEXT_PUBLIC_NODE_URL}/api/file/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${session.account.id_token}`,
            // 'Origin': process.env.NEXT_PUBLIC_APP_URL
        }
    }).then((e) => {
        toast.success('File Uploaded', {
            position: "bottom-right",
            autoClose: 2000,
        });
        return true


    }).catch(function (error) {
        console.log('Error', error);
        toast.error('File Upload failed', {
            position: "bottom-right",
            autoClose: 2000,
        });
    });
    return data;

}

export { getFile, postFile, deleteFile }