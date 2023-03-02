import React, { useEffect, useState, useRef } from 'react';
import {
    FileButton,
    Badge, Button,
    Table, Select,
    Group,
    Text,
    ActionIcon, Tooltip,
    Anchor, Paper,
    ScrollArea, CopyButton,
    useMantineTheme,
} from '@mantine/core';
import { IconTrash, IconDownload, IconCheck, IconCopy } from '@tabler/icons';
import { ToastContainer, toast } from 'react-toastify';
import { getFile, postFile, deleteFile } from '../components/fileController'
import { useSession } from "next-auth/react"
import bytes from "bytes"


export default function Dashboard() {
    const theme = useMantineTheme();
    const ref = useRef(null);
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [selValue, setSelValue] = useState('private');
    const { data: session } = useSession();

    // Delete data from server
    async function delAPI(key) {
        let response = await deleteFile(session, key)
        if (response) {
            fetchMyAPI(session)
        }
    }

    // Upload data in to server
    async function postAPI() {
        let response = await postFile(session, file, selValue)
        if (response) {
            setFile(null)
            fetchMyAPI(session)
        }
    }

    // check duplicate before upload
    function uploadFile() {
        if (data.map(v => v.name).includes(file.name)) {
            toast.error('Duplicate file name detected', {
                position: "bottom-right",
                autoClose: 2000,
            });
            ref.current.value = null;
            setFile(null);
        } else {
            postAPI()
        }
    }

    useEffect(() => {
        if (file) uploadFile()
    }, [file])


    // Fetch data table
    async function fetchMyAPI(session) {
        let response = await getFile(session)
        setData(response)
    }
    useEffect(() => {
        if (session) fetchMyAPI(session)
    }, [session])


    // Render table array
    function dateConv(d) {
        const date = new Date(d);
        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    }
    const rows = data?.map((item, i) => (
        <tr key={i}>
            <td>
                <Group spacing="sm">
                    <Text size="sm" weight={500}>
                        {item.name}
                    </Text>
                </Group>
            </td>
            <td>
                <Badge
                    color={item.private ? 'blue' : 'pink'}
                    variant={theme.colorScheme === 'dark' ? 'light' : 'outline'}
                >
                    {item.private ? 'Private' : 'Public'}
                </Badge>
            </td>
            <td>
                <Anchor<'a'> size="sm" href="#">
                    {dateConv(item.createdAt)}
                </Anchor>
            </td>
            <td>
                <Text size="sm" color="dimmed">
                    {bytes(item.size)}
                </Text>
            </td >
            <td>
                <Group spacing={0} >
                    <Tooltip label={'Delete'} withArrow position="right">
                        <ActionIcon onClick={() => delAPI(item.key)} color="red">
                            <IconTrash size={16} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label={'Download'} withArrow position="right">
                        <ActionIcon color="blue" component="a" target="_blank" href={`${process.env.NEXT_PUBLIC_APP_URL}/api/download?fid=${item._id}`} >
                            <IconDownload size={16} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                    {<CopyButton value={`${process.env.NEXT_PUBLIC_APP_URL}/api/download?fid=${item._id}`} timeout={2000}>
                        {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>}
                </Group>
            </td>
        </tr >
    ));


    return (<>
        <h1>Dashboard</h1>
        <Paper
            radius="md"
            withBorder
            p="lg"
            sx={(theme) => ({
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            })}
        >
            <Group position="center">
                <FileButton onChange={setFile} accept="*/*" ref={ref}>
                    {(props) => <Button {...props}>Upload file</Button>}
                </FileButton>
                <Select
                    value={selValue} onChange={setSelValue}

                    placeholder="Pick one"
                    data={[
                        { value: 'private', label: 'Private' },
                        { value: 'public', label: 'Public' },
                    ]}
                />
            </Group>
            {file && (
                <Text size="sm" align="center" mt="sm">
                    Picked file: {file.name} &  Uploading...
                </Text>
            )}
            <div>
                <ToastContainer />
            </div>
        </Paper>
        <Paper
            mt={'md'}
            radius="md"
            withBorder
            p="lg"
            sx={(theme) => ({
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            })}
        >
            <ScrollArea>
                <Table sx={{ margin: '0 auto' }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Permission</th>
                            <th>CreatedOn</th>
                            <th>Size</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </ScrollArea>
        </Paper>
    </>
    );
}