import React, { useRef, useState } from 'react';
import { Dropzone, FileWithPath, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { Button, Center, createStyles, Drawer, Group, SimpleGrid, Space, Stack, Text, Title } from '@mantine/core';
import { TEN_MB } from '../../utils/constants';
import { IconCloudUpload, IconUpload, IconX } from '@tabler/icons';
import DocumentInfo from '../../components/DocumentInfo';

const useStyles = createStyles(theme => ({
	wrapper: {
		position: 'relative',
		marginBottom: 30
	},

	dropzone: {
		borderWidth: 1,
		paddingBottom: 50
	},

	icon: {
		color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4]
	},

	control: {
		position: 'absolute',
		width: 250,
		left: 'calc(50% - 125px)',
		bottom: -20
	}
}));

const InvoiceUploadForm = ({ opened, onClose, form, loading, onSubmit, goBack }) => {
	const [file, setFile] = useState<FileWithPath>(null);
	const { classes, theme } = useStyles();
	const openRef = useRef<() => void>(null);

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			padding='xl'
			size='xl'
			position='right'
			classNames={{
				drawer: 'flex h-full items-center'
			}}
			transitionDuration={250}
			transitionTimingFunction='ease'
		>
			<Stack>
				<Title order={2} weight={500}>
					<span>Upload Invoice</span>
				</Title>
				<div className={classes.wrapper}>
					<Dropzone
						openRef={openRef}
						onDrop={file => {
							setFile(file[0]);
						}}
						onReject={files => console.log('rejected files', files)}
						maxSize={TEN_MB}
						className={classes.dropzone}
						accept={[...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE]}
						loading={loading}
					>
						<Group position='center' spacing='xl' style={{ pointerEvents: 'none' }}>
							<Dropzone.Accept>
								<IconUpload
									size={50}
									stroke={1.5}
									color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
								/>
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX
									size={50}
									stroke={1.5}
									color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
								/>
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconCloudUpload
									size={50}
									color={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black}
									stroke={1.5}
								/>
							</Dropzone.Idle>
						</Group>
						<Text align='center' weight={700} size='lg' mt='xl'>
							<Dropzone.Accept>Drop Image here</Dropzone.Accept>
							<Dropzone.Reject>Image file more than 10mb</Dropzone.Reject>
							<Dropzone.Idle>Upload PDF</Dropzone.Idle>
						</Text>
						<Text align='center' size='sm' mt='xs' color='dimmed'>
							Drag&apos;n&apos;drop files here to upload. We can accept
							only <i>.pdf</i> and <i>.docx</i>&nbsp;files that are less than 10mb in size.
						</Text>
					</Dropzone>
					<Button className={classes.control} size='md' radius='xl' onClick={() => openRef.current?.()}>
						{file ? "Change file" : "Select file"}
					</Button>
				</div>
				{file && <Center><DocumentInfo fileInfo={file} /></Center>}
				<Space h='xl' />
				<Group position='right'>
					<Button type='button' variant='white' size='md' onClick={goBack}>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button type='submit' size='md' onClick={onSubmit} disabled={!file}>
						<Text weight='normal'>Upload</Text>
					</Button>
				</Group>
			</Stack>
		</Drawer>
	);
};

export default InvoiceUploadForm;
