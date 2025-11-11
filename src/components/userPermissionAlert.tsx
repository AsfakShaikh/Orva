import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@styles/Theme';
import scaler from '@utils/Scaler';
import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import { Strings } from '@locales/Localization';

const SHOW_USER_CONSENT_MODAL_EVENT = 'SHOW_USER_CONSENT_MODAL';
type userConsent = {
    title: string;
    message: string;
    onConfirm: () => void;
}
export function toggleUserConsentModal(userDetail: userConsent) {

    emitEvent(SHOW_USER_CONSENT_MODAL_EVENT, userDetail);
}
const UserPermissionAlert = () => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => { });
    useEventEmitter(SHOW_USER_CONSENT_MODAL_EVENT, (userDetail: userConsent) => {
        setVisible(true);
        setTitle(userDetail?.title);
        setMessage(userDetail?.message);
        setOnConfirm(() => userDetail?.onConfirm);
    });


    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.header}>{title}</Text>
                    <Text style={styles.body}>{message}</Text>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Text style={[styles.button, styles.cancelButton]}>{Strings.no_goBack}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onConfirm()}>
                            <Text style={styles.button}>{Strings.yes_proceed}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const { colors } = theme;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F1F1F',
    },
    container: {
        width: scaler(300),
        padding: scaler(20),
        borderRadius: scaler(15),
        backgroundColor: 'white',
    },
    header: {
        fontSize: scaler(20),
        fontWeight: '500',
        marginBottom: scaler(10),
        color: '#000',
    },
    body: {
        textAlign: 'left',
        marginBottom: scaler(15),
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    button: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    cancelButton: {
        marginRight: scaler(20),
    },
});

export default UserPermissionAlert;
