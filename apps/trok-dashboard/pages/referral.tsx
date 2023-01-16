import { Button, Card, Group, List, Popover, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import Page from '../layout/Page';
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { trpc } from '../utils/clients';

const Referral = ({ referral_code, session_id }) => {
	const { data: account } = trpc.user.getAccount.useQuery({ id: session_id }, { enabled: !!session_id });

	return (
		<Page.Container
			classNames='flex flex-col'
			header={
				<Page.Header>
					<span className='heading-1 capitalize'>Refer & Earn</span>
				</Page.Header>
			}
		>
			<Page.Body>
				<Title order={3} weight={500} mb='lg'>
					Refer Trok Fuel Card to a fleet and you’ll get up to £300 in credit
				</Title>
				<SimpleGrid cols={2}>
					<Card shadow='sm' p='lg' radius='xs'>
						<Stack>
							<span className='font-medium'>You can share your personal referral link</span>
							<TextInput
								readOnly
								styles={{
									input: {
										border: '1px solid #3646F5',
										backgroundColor: '#D1D5FD'
									}
								}}
								defaultValue={`https://www.trok.co/referral/${referral_code}`}
								rightSection={
									<Popover width='target' position='bottom' withArrow shadow='md'>
										<Popover.Target>
											<Button radius={0}>
												<Text
													weight='normal'
													onClick={() =>
														navigator.clipboard
															.writeText(`https://www.trok.co/referral/${referral_code}`)
															.then(() => {
																console.log('link copied!');
															})
													}
												>
													Copy Link
												</Text>
											</Button>
										</Popover.Target>
										<Popover.Dropdown p='xs'>
											<Text size='sm'>Link copied!</Text>
										</Popover.Dropdown>
									</Popover>
								}
								rightSectionProps={{
									padding: 0,
									margin: 0
								}}
								rightSectionWidth={92}
							/>
							<span className='text-lg font-semibold'>Your Earnings</span>
							<Group spacing={40}>
								<span className='font-medium'>Credits Earned: £0</span>
								<span className='font-medium'>Referrals: {account?.referrals.length ?? 0}</span>
							</Group>
						</Stack>
					</Card>
					<Card shadow='sm' p='lg' radius='xs'>
						<Stack>
							<span className='heading-1'>How it works</span>
							<List type='ordered' spacing='xs'>
								<List.Item>Share your referral link with another fleet owner</List.Item>
								<List.Item>They sign up on Trok and start using our cards</List.Item>
								<List.Item>
									Once they’ve purchased 1000 litres of fuel using our cards, we apply a £50 credit on
									your next statement. If the fleet you referred has over 10 vehicles, then we apply a
									£300 credit
								</List.Item>
							</List>
						</Stack>
					</Card>
				</SimpleGrid>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	const token = await getToken({ req });
	return {
		props: {
			session_id: session?.id,
			referral_code: token.user?.referral_code
		}
	};
}

export default Referral;
