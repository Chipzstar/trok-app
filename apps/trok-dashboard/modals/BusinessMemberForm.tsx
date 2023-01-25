import React, { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, Tabs, Space, Text, TextInput } from '@mantine/core';
import { useForm, isEmail } from '@mantine/form';
import { NewOnboardingMemberInfo } from '@trok-app/shared-utils';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
const BusinessMemberForm = ({opened, onClose, onSubmit, loading}) => {
    const form = useForm<NewOnboardingMemberInfo>({
        initialValues: {
            dob: '',
            email: '',
            firstname: '',
            lastname: '',
            full_name: ''
        },
        validate: {
            firstname: value => !value ? "Required" : null,
            lastname: value => !value ? "Required" : null,
            email: isEmail("Invalid Email"),
            dob: value => !value ? "Required" : null,
        }
    })
    return (
            <Modal
                opened={opened}
                onClose={onClose}
                centered
                padding='lg'
                size='lg'
                title='Add Owner'
                styles={{
                title: {
                    fontSize: 24,
                    fontWeight: 500
                },
                    header: {
                    paddingBottom: 8,
                        borderBottom: '1px solid #E5E5E5'
                }
            }}
                >
                <form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
                    <Group grow>
                        <TextInput withAsterisk label='First name' {...form.getInputProps('firstname')} data-cy="onboarding-director-firstname"/>
                        <TextInput withAsterisk label='Last name' {...form.getInputProps('lastname')} data-cy="onboarding-director-lastname"/>
                    </Group>
                    <Group grow>
                        <TextInput withAsterisk label='Email' {...form.getInputProps('email')} data-cy="onboarding-director-email"/>
                        <DatePicker
                            withAsterisk
                            placeholder={'Pick a date'}
                            label='Date of Birth'
                            maxDate={dayjs().subtract(13, "years").toDate()}
                            inputFormat='DD-MM-YYYY'
                            value={dayjs(form.values.dob).isValid() ? dayjs(form.values.dob).toDate() : null}
                            onChange={date => form.setFieldValue('dob', date)}
                            error={form.errors.dob}
                            initialLevel="year"
                            data-cy="onboarding-director-dob"
                        />
                    </Group>
                    <Space h="lg"/>
                    <Group position='right'>
                        <Button variant="outline" type='button' onClick={onClose} styles={{
                            root: {
                                width: 90,
                            }
                        }}>
                            <Text weight={500}>Cancel</Text>
                        </Button>
                        <Button disabled={!form.isDirty()} type='submit' loading={loading} styles={{
                            root: {
                                width: 90,
                            }
                        }}>
                            <Text weight={500}>Save</Text>
                        </Button>
                    </Group>
                    </form>
                </Modal>
    )
}

export default BusinessMemberForm;