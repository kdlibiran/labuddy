import { Input, InputField } from "@gluestack-ui/themed";
import React from "react";
interface CustomInputProps {
    placeholder: string;
    onChangeText: (value: string) => void;
    value?: string;
    isDisabled?: boolean;
}

export default function CustomInput({
    placeholder,
    onChangeText,
    value,
    isDisabled = false
}: CustomInputProps) {
    return (
        <Input
            variant="outline"
            size="md"
            isDisabled={isDisabled}
            isInvalid={false}
            isReadOnly={false}
        >
            <InputField
                placeholder={placeholder}
                onChangeText={onChangeText}
                value={value}
            />
        </Input>
    );
} 