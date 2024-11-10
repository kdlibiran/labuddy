import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { Heading, FormControl, VStack, Text, Input, InputField, InputSlot, InputIcon, Button, ButtonText, Box } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { useRouter } from "expo-router";
import React from 'react';

export default function App() {
  const [showPassword, setShowPassword] = useState(false)
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState
    })
  }
  const router = useRouter()
  return (
    <GluestackUIProvider config={config}>
      <View style={styles.container}>
        <Box width="90%">
          <FormControl
            padding={4}
            borderWidth={1}
            borderRadius={8}
            borderColor="$borderLight300"
            $dark-borderWidth={1}
            $dark-borderRadius={8}
            $dark-borderColor="$borderDark800"
          >
            <VStack space="xl">
              <Heading color="$text900" lineHeight="$md">
                Login to Labuddy 
              </Heading>
              <VStack space="xs">
                <Text color="$text500" lineHeight="$sm">
                  Email
                </Text>
                <Input>
                  <InputField type="text" />
                </Input>
              </VStack>
              <VStack space="xs">
                <Text color="$text500" lineHeight="$sm">
                  Password
                </Text>
                <Input>
                  <InputField textAlign="center" type={showPassword ? "text" : "password"} />
                  <InputSlot paddingRight={3} onPress={handleState}>
                    <InputIcon
                      as={showPassword ? EyeIcon : EyeOffIcon}
                      color="$darkBlue500"
                    />
                  </InputSlot>
                </Input>
              </VStack>
              <Button
                marginLeft="auto"
                onPress={() => {
                  //nav to next
                  {router.push('/dashboard.js')}
                }}
              >
                <ButtonText color="$white">Save</ButtonText>
              </Button>
            </VStack>
          </FormControl>
        </Box>
        <StatusBar style="auto" />
      </View>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
