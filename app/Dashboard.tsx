import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Platform,
    Pressable,
    Alert,
    Dimensions,
    useWindowDimensions
} from "react-native";
import { useState, useEffect, useRef } from "react";
import {
    KeyboardAvoidingView,
    Heading,
    VStack,
    Text,
    Input,
    InputField,
    Box,
    Button,
    ButtonText,
    ButtonIcon,
    AddIcon,
    CloseIcon,
    CloseCircleIcon,
    EditIcon,
    RemoveIcon,
    TrashIcon,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalBody,
    ModalHeader,
    ModalCloseButton,
    ModalFooter,
    Icon,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    ChevronDownIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
    ScrollView,
    Switch,
    HStack
} from "@gluestack-ui/themed";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { useNavigation, router } from "expo-router";
import LabuddyCard from "./labuddycard";
import supabase from "../lib/supabase";
import axios from "axios";
import React from "react";
import CustomModal from './components/CustomModal';
import CustomInput from './components/CustomInput';

export default function Dashboard() {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [networks, setNetworks] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState<boolean>(false); // For adding a labuddy
    const [showModal2, setShowModal2] = useState<boolean>(false); // For creating a network
    const [showModal3, setShowModal3] = useState<boolean>(false); // For editing a network
    const [showModal4, setShowModal4] = useState<boolean>(false); // For deleting a network
    const [showModal5, setShowModal5] = useState<boolean>(false); // For editing labuddy
    const [showModal_LeaveGroup, setShowModal_LeaveGroup] = useState<boolean>(false); // For leaving a labuddy group
    const [showModalJoin, setShowModalJoin] = useState<boolean>(false); // For requesting to join a labuddy group
    const [showModal_ViewReqs, setShowModal_ViewReqs] = useState<boolean>(false); // For viewing incoming labuddy group requests
    const [selectedLabuddy, setSelectedLabuddy] = useState<any>();
    const [reqUsername, setRequestUsername] = useState<any>();
    const [buttonsVisible, setbuttonsVisible] = useState<boolean>(false);
    const ref = useRef<any>(null);
    const ref2 = useRef<any>(null);

    const [formData, setFormData] = useState({
        wifi_name: "",
        wifi_password: "",
        network_id: "",
        cost: 0,
        perKilo: true,
        maxload: 0,
        labuddy_name: "",
        form_white_max: 0,
        form_color_max: 0,
        network_req: ""
    });

    async function getTotalWeight(id: string) {
        let { data, error } = await supabase.from("labuddy_group_weight").select("*").eq("network_id", id);
        if (data) {
            const colorsum = data[0].colorsum;
            const whitesum = data[0].whitesum;
            return [whitesum, colorsum];
        }
        return [0, 0];
    }

    function calcNumLoads(weight: number, maxload: number) {
        if (maxload === 0 || maxload == null || isNaN(maxload)) 
            return 0;
        
        const ret = weight / maxload;
        if (Math.floor(ret) == ret) 
            return ret;
        else 
            return ret + 1;
    }

    const handleChange = (name: string, value: string | number) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        console.log(formData);
    };

    const handleToggle = (name: keyof typeof formData) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: !prevData[name]
        }));
        console.log(formData);
    };

    async function updateSupabase(labuddyid: string) {
        console.log(formData.labuddy_name);
        if (formData.labuddy_name != "") {
            const { data: lbuddy, error: lbuddyError } = await supabase
                .from("users")
                .update({ first_name: formData.labuddy_name })
                .eq("id", labuddyid)
                .select("first_name, id");
        }

        if (formData.form_white_max != 0) {
            const { data: lbuddy, error: lbuddyError } = await supabase
                .from("baskets")
                .update({ white_weight_limit: formData.form_white_max })
                .eq("id", labuddyid)
                .select("white_weight_limit, id");
        }

        if (formData.form_color_max != 0) {
            const { data: lbuddy, error: lbuddyError } = await supabase
                .from("baskets")
                .update({ color_weight_limit: formData.form_color_max })
                .eq("id", labuddyid)
                .select("white_weight_limit, id");
        }

        if (formData.network_id != "") {
            const { data: lbuddy, error: lbuddyError } = await supabase
            .from("baskets")
            .update({network_id: formData.network_id})
            .eq("id", labuddyid)
            .select("network_id, id")
        }
    }

    useEffect(() => {
        navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
            console.log("onback");
            // Do your stuff here
            navigation.dispatch(e.data.action);
        });
        const fetchData = async () => {
            await getUserMetadata();
            await fetchNetworks();
            setLoading(false); // Set loading to false after fetching data
        };
        
        fetchData();
        
        const subscription1 = supabase
            .channel("public:baskets")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "baskets" },
                (payload) => {
                    console.log("Change received!", payload);
                    fetchNetworks();
                }
            )
            .subscribe();

        const subscription2 = supabase
            .channel("public:network_users")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "network_users" },
                (payload) => {
                    console.log("Change received!", payload);
                    fetchNetworks();
                }
            )
            .subscribe();

        const subscription3 = supabase
            .channel("public:users")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "users" },
                (payload) => {
                    console.log("Change received!", payload);
                    fetchNetworks();
                }
            )
            .subscribe();

            const subscription4 = supabase
            .channel("public:network_requests")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "network_requests" },
                (payload) => {
                    console.log("Change received!", payload);
                    fetchNetworks();
                }
            )
            .subscribe();
        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(subscription1);
            supabase.removeChannel(subscription2);
            supabase.removeChannel(subscription3);
            supabase.removeChannel(subscription4);
        };
    }, []);

    useEffect(() => {
        if (networks.length > 0) {
          fetchNetworkRequests();
        }
      }, [networks]);

    async function getUserMetadata() {
        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error fetching data:", userError);
        } else {
            // Handle the case where data might be null
            setMetadata(user?.user || []);
            console.log("metadata is ", { metadata });
        }
    }

    async function fetchNetworks() {
        //get user data
        const { data: userdata, error: userError } =
            await supabase.auth.getUser();
        //get network that user can access
        const { data: network, error: networkError } = await supabase
            .from("network_users")
            .select("networks(*, baskets(*, users(*)))")
            .eq("user_id", userdata?.user?.id)
    
        network?.map(async (network: any) => {
            if(network?.networks?.baskets?.length > 0){
                const id = network.networks.id;
                [network.networks.whitesum, network.networks.colorsum] = await getTotalWeight(id);
            }else{
                [network.networks.whitesum, network.networks.colorsum] = [0,0];
            }
            return network;
        })
        

        setNetworks(network || []);
        console.log("networks:", network);
    }

    async function fetchNetworkRequests() {
        //fetchNetworks();
        //get user data
        const myNetworks = networks.map((x)=>x.networks)
        const myOwnedNetworks = myNetworks.filter(checkOwned)
        const { data: userdata, error: userError } =
            await supabase.auth.getUser();
        //get network that user can access
        const allReqs: any[] = [];
        console.log("owned:", myOwnedNetworks.map((x)=>x.id));
        if (myOwnedNetworks.length > 0) {
            myOwnedNetworks.map(async (x) => {
            const { data: reqs, error: networkError } = await supabase
                .from("network_requests")
                .select(`networks(id, name), users(id, first_name, last_name)`)
                .eq("network_id", x.id)
                if (networkError){ console.log(networkError)}
                else allReqs.push(...reqs)
            })
        }

        setRequests(allReqs || []);
        console.log("allReqs:", allReqs);
    }

    const doLogout = async (event: any) => {
        const { error } = await supabase.auth.signOut();
        router.replace("/Login");
    };

    async function addLabuddy(formData: any) {
        const url = "http://192.168.4.1/connect"; // corrected the URL scheme
        const wifi_settings = {
            network: formData["network_id"],
            ssid: formData["wifi_name"],
            password: formData["wifi_password"]
        };
        try {
            const response = await axios.post(url, wifi_settings, {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            });
        } catch (error: any) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error("Response error:", error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                console.error("Request error:", error.request);
            } else {
                // Something else happened while setting up the request
                console.error("Error:", error.message);
            }
        }
    }

    async function createNetwork(formData: any) {
        try {
            const name = formData["network_name"];
            const { data, error } = await supabase
                .from("networks")
                .insert([{ name: name, owner_id: metadata.id }])
                .select();
            if (data) {
            const new_network_id = data[0].id;
                console.log(new_network_id);

                const { data: network_user, error: networkUserError } =
                    await supabase
                    .from("network_users")
                    .insert([
                        { user_id: metadata.id, network_id: new_network_id }
                    ])
                    .select();

                console.log("network_user", network_user);
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    async function removeRequest(user: string, net: string) {
        try {
            const { data, error } = await supabase
                .from("network_requests")
                .delete()
                .match( {network_id: net, user_id: user})
            if (error){
                console.log(error)
                Alert.alert('Error', "Can't delete request")
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    async function approveRequest(user: string, net: string) {
        try {
            const { data, error } = await supabase
                .from("network_users")
                .insert([
                    { user_id: user, network_id: net }
                ])
                .eq('network_id', net)
                .eq('user_id', user)
            if (error){
                console.log(error)
                Alert.alert('Error', "Can't approve request")
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    async function getRequestUsername(r: any) {
        try {
            const { data, error } = await supabase
                .from("users")
                .select('name')
                .eq('id', r.user_id)
            if (!data) {
                Alert.alert('Error','User not found.')
            }
            else{
                console.log(data[0])
                setRequestUsername(data[0])
            }
        } catch (e: any) {
            console.log(e);
            return('null')
        }
    }

    function checkOwned(nw: any){
        return nw.owner_id == metadata.id;
    }

    async function joinNetwork(formData: any) {
        const req = formData.network_req
        const myNetworks = networks.map((x)=>x.networks)
        const myOwnedNetworks = myNetworks.filter(checkOwned)
        try {
            const { data, error } = await supabase
                .from("networks")
                .select()
                .match({name:req})
            if (!data) {
                Alert.alert('Error','Labuddy Group not found.')
            }
            else{
            const req_network_id = data[0].id;
            console.log(myNetworks.map((x)=>x.owner_id))
            console.log(req_network_id);
            if(myNetworks.map((x)=>x.id).includes(req_network_id)){
                console.log('Already a part of this Labuddy Group')
                Alert.alert('Error','Already a part of this Labuddy Group.')
            }
            else{
            const { data: network_user, error: networkUserError } =
                await supabase
                    .from("network_requests")
                    .insert([
                        { network_id: req_network_id, user_id: metadata.id }
                    ])
                    .select();
                if (networkUserError){
                    console.log(networkUserError)
                    console.log('Already requested')
                    Alert.alert('Error','You already have a pending request to this Labuddy Group. Please wait for the owner to entertain your request.')
                }
                }
            }
        } catch (e: any) {
            Alert.alert("Error", "Labuddy Group not found.");
            console.log(e);
        }
        //console.log(networks.map((x)=>x.networks.name))
        //console.log(formData.network_req)
    }

    async function editNetwork(formData: any) {
        try {
            const newName = formData["network_name"];
            const id = formData["network_id"];
            const { data, error } = await supabase
                .from("networks")
                .update([{ name: newName }])
                .eq("id", id);
            await fetchNetworks();
        } catch (e: any) {
            console.log(e);
        }
    }

    async function deleteNetwork(formData: any) {
        try {
            const id = formData["network_id"];
            const { data, error } = await supabase
                .from("networks")
                .delete()
                .eq("id", id);
            await fetchNetworks();
            console.log(id)
        } catch (e: any) {
            console.log(e);
        }
    }

    async function leaveNetwork(formData: any) {
        try {
            const net_id = formData["network_id"];
            const user_id = metadata.id
            const { data, error } = await supabase
                .from("network_users")
                .delete()
                .match( {network_id:net_id, user_id:user_id} );
            await fetchNetworks();
        } catch (e) {
            console.log(e);
        }
    }

    const toggleDropDown = () => {
        setbuttonsVisible(!buttonsVisible);
      };
    
    if (loading) {
        return (
            <GluestackUIProvider config={config}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </GluestackUIProvider>
        );
    }

    const renderAddLabuddyModal = () => (
        <CustomModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Add Labuddy"
            primaryAction={{
                label: "Add",
                onPress: () => {
                    addLabuddy(formData);
                    setShowModal(false);
                }
            }}
            secondaryAction={{
                label: "Cancel",
                onPress: () => setShowModal(false)
            }}
            finalFocusRef={ref}
        >
            <VStack space="md">
                <Text>
                    Add your Labuddies here.
                    To add a Labuddy:
                    <Text size="sm">
                        {'\n'}
                        {'\u2022'} Connect to the Access Point of the Labuddy.
                        {'\n\u2022'} Enter the wifi credentials below.
                        {'\n\u2022'} Select the Labuddy Group.
                    </Text>
                </Text>
                <CustomInput
                    placeholder="Wifi Name"
                    onChangeText={(value) => handleChange("wifi_name", value)}
                />
                <CustomInput
                    placeholder="Wifi Password"
                    onChangeText={(value) => handleChange("wifi_password", value)}
                />
                <Select
                    onValueChange={(
                        network
                    ) => {
                        handleChange(
                            "network_id",
                            network
                        );
                    }}
                >
                    <SelectTrigger
                        variant="outline"
                        size="md"
                    >
                        <SelectInput placeholder="Select Labuddy Group" />
                        <SelectIcon>
                            <Icon
                                as={
                                    ChevronDownIcon
                                }
                            />
                        </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {networks.length >
                                0 ? (
                                networks.map(
                                    (
                                        network
                                    ) => (
                                        <SelectItem
                                            label={
                                                network
                                                    .networks
                                                    .name
                                            }
                                            value={
                                                network
                                                    .networks
                                                    .id
                                            }
                                            key={
                                                network
                                                    .networks
                                                    .id
                                            }
                                        />
                                    )
                                )
                            ) : (
                                <SelectItem
                                    label="You are not part of any Labuddy Groups"
                                    value="None"
                                    isDisabled={
                                        true
                                    }
                                />
                            )}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </VStack>
        </CustomModal>
    );

    // Example of converting the Create Group modal:
    const renderCreateGroupModal = () => (
        <CustomModal
            isOpen={showModal2}
            onClose={() => {
                setShowModal2(false);
                handleChange("network_name", "");
            }}
            title="Create Labuddy Group"
            primaryAction={{
                label: "Add",
                onPress: () => {
                    createNetwork(formData);
                    setShowModal2(false);
                }
            }}
            secondaryAction={{
                label: "Cancel",
                onPress: () => setShowModal2(false)
            }}
            finalFocusRef={ref}
        >
            <VStack space="md">
                <Text>
                    Create a Labuddy Group for Labuddies to connect to!
                    You will see all Labuddies connected, and
                    everyone else connected will see the same.
                </Text>
                <CustomInput
                    placeholder="Labuddy Group Name"
                    onChangeText={(value) => handleChange("network_name", value)}
                />
            </VStack>
        </CustomModal>
    );

    // Example of converting the Join Group modal:
    const renderJoinGroupModal = () => (
        <CustomModal
            isOpen={showModalJoin}
            onClose={() => {
                setShowModalJoin(false);
                handleChange("network_req", "");
            }}
            title="Join Labuddy Group"
            primaryAction={{
                label: "Request to Join",
                onPress: () => {
                    joinNetwork(formData);
                    setShowModalJoin(false);
                }
            }}
            secondaryAction={{
                label: "Cancel",
                onPress: () => setShowModalJoin(false)
            }}
            finalFocusRef={ref}
        >
            <VStack space="md">
                <Text>
                    Request to join a Labuddy Group to see other Labuddies in a household! 
                    Enter the name of the Labuddy Group you want to join.
                </Text>
                <CustomInput
                    placeholder="Labuddy Group Name"
                    onChangeText={(value) => handleChange("network_req", value)}
                />
            </VStack>
        </CustomModal>
    );

    // Example of converting the Edit Group modal:
    const renderEditGroupModal = () => (
        <CustomModal
            isOpen={showModal3}
            onClose={() => setShowModal3(false)}
            title="Edit Labuddy Group"
            primaryAction={{
                label: "Edit",
                onPress: () => {
                    editNetwork(formData);
                    setShowModal3(false);
                }
            }}
            secondaryAction={{
                label: "Cancel",
                onPress: () => setShowModal3(false)
            }}
            finalFocusRef={ref}
        >
            <VStack space="md">
                <Text>Edit your group here.</Text>
                <CustomInput
                    placeholder="New Group Name"
                    onChangeText={(value) => handleChange("network_name", value)}
                />
            </VStack>
        </CustomModal>
    );

    // Convert the Delete Group modal
    const renderDeleteGroupModal = () => (
        <CustomModal
            isOpen={showModal4}
            onClose={() => setShowModal4(false)}
            title="Delete Labuddy Group?"
            primaryAction={{
                label: "Delete",
                onPress: () => {
                    deleteNetwork(formData);
                    setShowModal4(false);
                }
            }}
            secondaryAction={{
                label: "Cancel",
                onPress: () => setShowModal4(false)
            }}
            finalFocusRef={ref}
        >
            <Text>You will be deleting this group forever.</Text>
        </CustomModal>
    );

    // Convert the Leave Group modal
    const renderLeaveGroupModal = () => (
        <CustomModal
            isOpen={showModal_LeaveGroup}
            onClose={() => setShowModal_LeaveGroup(false)}
            title="Leave Labuddy Group?"
            primaryAction={{
                label: "Leave",
                onPress: () => {
                    leaveNetwork(formData);
                    setShowModal_LeaveGroup(false);
                }
            }}
            secondaryAction={{
                label: "Cancel",
                onPress: () => setShowModal_LeaveGroup(false)
            }}
            finalFocusRef={ref}
        >
            <Text>
                Make sure all your Labuddies have left this group as well.
                Otherwise, you will leave them here which is just sad 🥲
            </Text>
        </CustomModal>
    );

    // Convert the View Requests modal
    const renderViewRequestsModal = () => (
        <CustomModal
            isOpen={showModal_ViewReqs}
            onClose={() => setShowModal_ViewReqs(false)}
            title={requests.length > 0 ? "People want to join your Labuddy Groups!" : "No join requests."}
            primaryAction={{
                label: "Done",
                onPress: () => setShowModal_ViewReqs(false)
            }}
            finalFocusRef={ref}
        >
            {requests.length > 0 ? (
                requests.map((req) => (
                    <View key={req.users.id + req.networks.id}>
                        <Box
                            padding={4}
                            borderWidth={1}
                            borderRadius={8}
                            borderColor="$borderLight300"
                            style={{ flex: 1, minWidth: 200 }}
                        >
                            <VStack space="xs">
                                <Text>{req.users.first_name} {req.users.last_name} wants to join {req.networks.name}</Text>
                                <HStack space="md">
                                    <Button 
                                        action="positive" 
                                        size="xs" 
                                        bg="green"
                                        onPress={() => {
                                            approveRequest(req.users.id, req.networks.id);
                                            removeRequest(req.users.id, req.networks.id);
                                            setShowModal_ViewReqs(false);
                                        }}
                                    >
                                        <ButtonText>Approve</ButtonText>
                                    </Button>
                                    <Button 
                                        size="xs" 
                                        bg={styles.logout.backgroundColor}
                                        onPress={() => {
                                            removeRequest(req.users.id, req.networks.id);
                                            setShowModal_ViewReqs(false);
                                        }}
                                    >
                                        <ButtonText>Reject</ButtonText>
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    </View>
                ))
            ) : null}
        </CustomModal>
    );

    // Convert the Edit Labuddy modal
    const renderEditLabuddyModal = () => (
        <CustomModal
            isOpen={showModal5}
            onClose={() => setShowModal5(false)}
            title={`Edit ${selectedLabuddy?.users?.first_name || "Labuddy"}`}
            primaryAction={{
                label: "Save",
                onPress: () => {
                    updateSupabase(selectedLabuddy.id);
                    setShowModal5(false);
                }
            }}
            finalFocusRef={ref}
        >
            <VStack space="md">
                <Heading size="xs">Name</Heading>
                <CustomInput
                    placeholder={selectedLabuddy?.users?.first_name || "Labuddy"}
                    onChangeText={(value) => handleChange("labuddy_name", value)}
                />

                <Heading size="xs">Max Weight for White Clothes</Heading>
                <CustomInput
                    placeholder={selectedLabuddy?.white_weight_limit?.toString()}
                    onChangeText={(value) => handleChange("form_white_max", value)}
                />

                <Heading size="xs">Max Weight for Colored Clothes</Heading>
                <CustomInput
                    placeholder={selectedLabuddy?.color_weight_limit?.toString()}
                    onChangeText={(value) => handleChange("form_color_max", value)}
                />

                <Heading size="xs">Labuddy Group</Heading>
                <Select
                    onValueChange={(network) => handleChange("network_id", network)}
                >
                    <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder="Same Labuddy Group" />
                        <SelectIcon>
                            <Icon as={ChevronDownIcon} />
                        </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {networks.length > 0 ? (
                                networks.map((network) => (
                                    <SelectItem
                                        label={network.networks.name}
                                        value={network.networks.id}
                                        key={network.networks.id}
                                    />
                                ))
                            ) : (
                                <SelectItem
                                    label="You are not part of any Labuddy Groups."
                                    value="None"
                                    isDisabled={true}
                                />
                            )}
                        </SelectContent>
                    </SelectPortal>
                </Select>

                <Button
                    size="sm"
                    action="positive"
                    borderWidth={0}
                    bg="$red500"
                    onPress={async () => {
                        const {data: lbuddy, error: err} = await supabase
                            .from("baskets")
                            .update({network_id: null})
                            .eq("id", selectedLabuddy.id)
                        if (err) console.log(err)
                    }}
                >
                    <ButtonText>Remove from Current Group</ButtonText>
                </Button>
            </VStack>
        </CustomModal>
    );

    return (
        <GluestackUIProvider config={config}>
            <ScrollView style={styles.scroll} padding={5} h="auto">
                <VStack space="md" style={styles.container} w="auto">
                    <HStack w="auto" space="md" style={styles.hstack}>
                        <Box
                            padding={4}
                            borderWidth={1}
                            borderRadius={8}
                            borderColor="$borderLight300"
                            style={{ flex: 1, minWidth: 200 }}
                        >
                            <VStack space="xl" w="auto">
                                <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <Heading>
                                        {metadata?.user_metadata?.first_name}'s
                                        Labuddies
                                    </Heading>
                                    <Button
                                        style={styles.button}
                                        onPress={ () => toggleDropDown() }
                                        >
                                        {
                                            (!buttonsVisible &&
                                            <ButtonIcon as={AddIcon}/>)
                                        }
                                        {
                                            (buttonsVisible &&
                                            <ButtonIcon as={RemoveIcon}/>)
                                        }
                                    </Button>
                                </Box>
                                { 
                                    buttonsVisible &&
                                    <>
                                        <Button
                                            style={styles.button}
                                            onPress={() => setShowModal(true)}
                                        >
                                            <ButtonText>Add Labuddy </ButtonText>
                                        </Button>
                                        <Button
                                            style={styles.button}
                                            onPress={() => setShowModal2(true)}
                                        >
                                            <ButtonText>Create Labuddy Group </ButtonText>
                                        </Button>
                                        <Button
                                            style={styles.outlinebutton}
                                            onPress={() => {setShowModalJoin(true);
                                                handleChange("network_req", "");
                                            }}
                                        >
                                            <ButtonText color="#028391">Join Labuddy Group</ButtonText>
                                        </Button>
                                        <Button
                                            style={styles.outlinebutton}
                                            onPress={() => {setShowModal_ViewReqs(true);}}
                                        >
                                            <ButtonText color="#028391">View Incoming Requests</ButtonText>
                                        </Button>
                                    </>
                                }

                                {/*Modal for ADDING LABUDDY*/}
                                {renderAddLabuddyModal()}
                                
                                {/*Modal for CREATE GROUP*/}
                                {renderCreateGroupModal()}
                                
                                {/*Modal for JOINING GROUP*/}
                                {renderJoinGroupModal()}

                                {/*Modal for EDITING GROUP*/}
                                {renderEditGroupModal()}

                                {/*Modal for CONFIRMING GROUP DELETION*/}
                                {renderDeleteGroupModal()}

                                {/*Modal for LEAVING GROUP*/}
                                {renderLeaveGroupModal()}
                                
                                {/*Modal for CONFIRMING GROUP DELETION*/}
                                {renderViewRequestsModal()}

                                <HStack space="md">
                                    <Text size="sm">Cost per kilogram</Text>
                                    <Switch
                                        isDisabled={false}
                                        isInvalid={false}
                                        onValueChange={(value) => {
                                            handleToggle("perKilo");
                                        }}
                                    />
                                    <Text size="sm">Cost per max load</Text>
                                </HStack>
                                <Input
                                    variant="outline"
                                    size="md"
                                    isDisabled={false}
                                    isInvalid={false}
                                    isReadOnly={false}
                                >
                                    <InputField
                                        placeholder={
                                            formData.perKilo
                                                ? "Cost per kilogram"
                                                : "Cost per max load"
                                        }
                                        onChangeText={(value) =>
                                            handleChange("cost", value)
                                        }
                                    />
                                </Input>
                                {
                                    !formData.perKilo &&
                                    <Input
                                        variant="outline"
                                        size="md"
                                        isDisabled={formData.perKilo}
                                        isInvalid={false}
                                        isReadOnly={false}
                                    >
                                    
                                            <InputField
                                                placeholder={"Max load (in kilograms)"}
                                                onChangeText={(value) =>
                                                    handleChange("maxload", value)
                                                }
                                            />
                                    </Input>
                                }
                            </VStack>
                        </Box>

                        <Box
                            padding={4}
                            borderWidth={1}
                            borderRadius={8}
                            borderColor="$borderLight300"
                            style={{ flex: 2, minWidth: 200 }}
                        >
                            <VStack space="xl">
                                {networks.length >   0 ? (
                                    networks.map((network) => (
                                        <View key={network.networks.id}>
                                            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                                            <Heading size="sm">
                                                Labuddy Group: {network.networks.name} 
                                            </Heading>
                                                {
                                                    network.networks?.owner_id == metadata.id && 
                                                    <HStack space="xs" justifyContent="flex-end">
                                                        <Button 
                                                            size="md" 
                                                            variant="link"
                                                            onPress={() => {
                                                                handleChange("network_id", network.networks.id)
                                                                setShowModal3(true)}}
                                                            ref={ref}
                                                            >
                                                        <ButtonIcon as={EditIcon}/>
                                                        </Button>
                                                        <Button
                                                            size="md" 
                                                            variant="link" 
                                                            onPress={() => {
                                                                handleChange("network_id", network.networks.id)
                                                                console.log(network.networks.id)
                                                                setShowModal4(true)}}>
                                                            <ButtonIcon as={TrashIcon}/>
                                                        </Button>
                                                    </HStack>
                                                } 
                                                {
                                                    network.networks?.owner_id != metadata.id && 
                                                    <HStack space="sm" justifyContent="flex-end">
                                                        <Button
                                                            size="md" 
                                                            variant="link"
                                                            onPress={() => {
                                                                handleChange("network_id", network.networks.id)
                                                                setShowModal_LeaveGroup(true)}}
                                                            ref={ref}
                                                        >
                                                        <ButtonIcon as={CloseCircleIcon}/>

                                                        </Button>
                                                    </HStack>//
                                                }
                                            </Box>
                                            {
                                                network.networks.baskets.length > 0 &&
                                                <Text size="xs" color="$gray500" bold={true}>
                                                    Total Weight (White): {network.networks.whitesum} kg{"\n"}
                                                    Total Weight (Colored): {network.networks.colorsum} kg{"\n"}
                                                    Cost:{" "}
                                                    {formData.perKilo
                                                        ? formData.cost * (network.networks.whitesum + network.networks.colorsum)
                                                        : Math.floor(calcNumLoads(network.networks.whitesum, formData.maxload)) *
                                                        formData.cost  + Math.floor(calcNumLoads(network.networks.colorsum, formData.maxload)) *
                                                        formData.cost }
                                                </Text>
                                            }
                                            {network.networks.baskets.length >
                                                0 ? (
                                                <VStack space="sm">
                                                    {network.networks.baskets.map(
                                                        (labuddy: any) => (
                                                            <View key={labuddy.id}>
                                                                <Pressable
                                                                    onPress={() => {
                                                                        setShowModal5(true)
                                                                        setSelectedLabuddy(labuddy)
                                                                    }} 
                                                                    bg="$primary500"
                                                                    $hover-bg="$primary400"
                                                                    style={{zIndex: 0}}
                                                                >
                                                                    <LabuddyCard
                                                                        labuddy={labuddy}
                                                                        cost={formData.cost}
                                                                        perKilo={formData.perKilo}
                                                                        maxload={formData.maxload}
                                                                    />
                                                                </Pressable>
                                                            </View>
                                                        )
                                                    )}
                                                </VStack>
                                            ) : (
                                                <VStack space="sm">
                                                    <Text>
                                                        No Labuddies found
                                                    </Text>
                                                </VStack>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <Text>No Labuddy Groups found</Text>
                                )}
                            </VStack>
                        </Box>
                    </HStack>
                    <Box
                        w="100%"
                        padding={4}
                        borderWidth={1}
                        borderRadius={8}
                        borderColor="$borderLight300"
                        style={{ flex: 2, minWidth: 200 }}
                    >
                        <Button style={styles.logout} onPress={doLogout}>
                            <ButtonText>Log out</ButtonText>
                        </Button>
                    </Box>
                    {showModal5 && selectedLabuddy && renderEditLabuddyModal()}
                    <StatusBar style="auto" />
                </VStack>
            </ScrollView>
        </GluestackUIProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    },
    button: {
        backgroundColor: "#028391"
    },
    outlinebutton: {
        borderWidth: 1,
        borderColor: "#028391",
        backgroundColor: "white"
    },
    logout: {
        backgroundColor: "#C70039"
    },
    scroll: {
        flex: 1,
        backgroundColor: "#fff"
    },
    hstack: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%"
    }
});
