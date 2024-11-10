import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Heading,
    ModalCloseButton,
    Icon,
    CloseIcon,
    Button,
    ButtonText,
    KeyboardAvoidingView
} from "@gluestack-ui/themed";
import React from "react";
import { Platform } from "react-native";

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    primaryAction?: {
        label: string;
        onPress: () => void;
        buttonProps?: any;
    };
    secondaryAction?: {
        label: string;
        onPress: () => void;
        buttonProps?: any;
    };
    finalFocusRef?: any;
}

export default function CustomModal({
    isOpen,
    onClose,
    title,
    children,
    primaryAction,
    secondaryAction,
    finalFocusRef
}: CustomModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} finalFocusRef={finalFocusRef}>
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">{title}</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        {children}
                    </KeyboardAvoidingView>
                </ModalBody>
                <ModalFooter>
                    {secondaryAction && (
                        <Button
                            variant="outline"
                            size="sm"
                            action="secondary"
                            mr="$3"
                            onPress={secondaryAction.onPress}
                            {...secondaryAction.buttonProps}
                        >
                            <ButtonText>{secondaryAction.label}</ButtonText>
                        </Button>
                    )}
                    {primaryAction && (
                        <Button
                            size="sm"
                            action="positive"
                            borderWidth={0}
                            onPress={primaryAction.onPress}
                            {...primaryAction.buttonProps}
                        >
                            <ButtonText>{primaryAction.label}</ButtonText>
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
} 