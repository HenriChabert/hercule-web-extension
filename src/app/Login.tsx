import browser from "webextension-polyfill";
import { Flex, Text, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { TextField } from "@radix-ui/themes";
import { MailIcon, KeyIcon } from "lucide-react";
import { useState } from "react";
import { LoginMessage, LoginMessageResponse } from "@/types/messages.type";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const isEmailValid = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async () => {
        if (!isEmailValid(email)) {
            setError("Invalid email address");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        try {
            const response = (await browser.runtime.sendMessage({
                type: "LOGIN",
                payload: { email, password },
            } as LoginMessage)) as LoginMessageResponse;

            if (response.success) {
                return navigate("/");
            } else {
                setError(response.payload?.error ?? "Invalid email or password");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setError("An error occurred during login: " + error);
        }
    };

    return (
        <Flex direction="column" height="600px" width="400px" px="8" py="4" align="center" className="!justify-center gap-4">
            <Text>Login</Text>
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-6 justify-center">
                <Flex direction="column" width="100%" gap="2">
                    <Flex direction="column" width="100%">
                        <Text>Email</Text>
                        <TextField.Root
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        >
                            <TextField.Slot>
                                <MailIcon height="16" width="16" />
                            </TextField.Slot>
                        </TextField.Root>
                    </Flex>
                    <Flex direction="column" width="100%">
                        <Text>Password</Text>
                        <TextField.Root
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                        >
                            <TextField.Slot>
                                <KeyIcon height="16" width="16" />
                            </TextField.Slot>
                        </TextField.Root>
                    </Flex>
                </Flex>
                {error && (
                    <Text color="red" align="center">
                        {error}
                    </Text>
                )}
                <Button onClick={handleLogin} type="submit">Login</Button>
            </form>
        </Flex>
    );
}

export default Login;
