export const NAME_SCHEMA = 'IndividualChatGroup/ParticipantSchema';

export const participantSchema = {
    name: NAME_SCHEMA,
    properties: {
        user_id: 'string',
        code_status: { type: 'int', optional: true },
    },
};