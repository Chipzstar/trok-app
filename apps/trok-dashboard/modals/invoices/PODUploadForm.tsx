import React, { useMemo, useRef, useState } from 'react';
import { Button, createStyles, Drawer, Image, Group, Space, Stack, Text, Title, SimpleGrid } from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconCloudUpload, IconUpload, IconX } from '@tabler/icons';
import { TEN_MB } from '../../utils/constants';

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

function Preview(props: { file: FileWithPath }) {
	const imageUrl = props.file ? URL.createObjectURL(props.file) : null;
	return imageUrl ? (
		<Image src={imageUrl} imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }} />
	) : null;
}

const PODUploadForm = ({ opened, onClose, form, onSubmit, loading, goBack }) => {
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
					<span>Upload Proof of Delivery</span>
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
						accept={IMAGE_MIME_TYPE}
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
							<Dropzone.Idle>Upload Proof of Delivery</Dropzone.Idle>
						</Text>
						<Text align='center' size='sm' mt='xs' color='dimmed'>
							Drag&apos;n&apos;drop files here to upload. We can accept only <i>.png</i> and <i>.jpg</i>{' '}
							files that are less than 10mb in size.
						</Text>
					</Dropzone>
					<Button className={classes.control} size='md' radius='xl' onClick={() => openRef.current?.()}>
						Select file
					</Button>
				</div>
				<SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
					<Preview file={file} />
				</SimpleGrid>
				<Space h='xl' />
				<Group position='right'>
					<Button type='button' variant='white' size='md' onClick={goBack}>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button type='submit' size='md' onClick={onSubmit}>
						<Text weight='normal'>Upload</Text>
					</Button>
				</Group>
			</Stack>
		</Drawer>
	);
};

export default PODUploadForm;
