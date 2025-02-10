import React, { useEffect } from "react";
import { Grid, Divider, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import countryList from "/src/data/countryList.json";

const EditRoomMailbox = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const tenantDomain = useSettings().currentTenant;
  const formControl = useForm({
    mode: "onChange",
  });

  const roomInfo = ApiGetCall({
    url: `/api/ListRooms?roomId=${roomId}&tenantFilter=${tenantDomain}`,
    queryKey: `Room-${roomId}`,
    waiting: false,
  });

  useEffect(() => {
    if (roomInfo.isSuccess && roomInfo.data?.[0]) {
      const room = roomInfo.data[0];
      formControl.reset({
        // Core Properties
        displayName: room.displayName,
        hiddenFromAddressListsEnabled: room.hiddenFromAddressListsEnabled,
        
        // Room Booking Settings
        capacity: room.capacity,
        
        // Location Information
        building: room.building,
        floor: room.floor,
        floorLabel: room.floorLabel,
        street: room.street,
        city: room.city,
        state: room.state,
        postalCode: room.postalCode,
        countryOrRegion: room.countryOrRegion
          ? countryList.find((c) => c.Name === room.countryOrRegion)?.Code || ""
          : "",
        
        // Room Equipment
        audioDeviceName: room.audioDeviceName,
        videoDeviceName: room.videoDeviceName,
        displayDeviceName: room.displayDeviceName,
        
        // Room Features
        isWheelChairAccessible: room.isWheelChairAccessible,
        phone: room.phone,
        tags: room.tags?.map(tag => ({ label: tag, value: tag })) || [],
      });
    }
  }, [roomInfo.isSuccess, roomInfo.data]);

  useEffect(() => {
    if (roomId) {
      roomInfo.refetch();
    }
  }, [router.query, roomId, tenantDomain]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`Room-${roomId}`}
      title="Edit Room Mailbox"
      backButtonTitle="Room Mailboxes Overview"
      postUrl="/api/EditRoomMailbox"
      
      customDataformatter={(values) => ({
        tenantID: tenantDomain,
        roomId: roomId,
        displayName: values.displayName?.trim(),
        hiddenFromAddressListsEnabled: values.hiddenFromAddressListsEnabled,
        
        // Room Booking Settings
        capacity: values.capacity,
        
        // Location Information
        building: values.building?.trim(),
        floor: values.floor,
        floorLabel: values.floorLabel?.trim(),
        street: values.street?.trim(),
        city: values.city?.trim(),
        state: values.state?.trim(),
        postalCode: values.postalCode?.trim(),
        countryOrRegion: values.countryOrRegion?.value || values.countryOrRegion,
        
        // Room Equipment
        audioDeviceName: values.audioDeviceName?.trim(),
        videoDeviceName: values.videoDeviceName?.trim(),
        displayDeviceName: values.displayDeviceName?.trim(),
        
        // Room Features
        isWheelChairAccessible: values.isWheelChairAccessible,
        phone: values.phone?.trim(),
        tags: values.tags?.map(tag => tag.value),
      })}
    >
      <Grid container spacing={2}>
        {/* Core & Booking Settings */}
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="number"
            label="Capacity"
            name="capacity"
            formControl={formControl}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Hidden From Address Lists"
            name="hiddenFromAddressListsEnabled"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Wheelchair Accessible"
            name="isWheelChairAccessible"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Location Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Location Information</Typography>
        </Grid>

        {/* Building and Floor Info */}
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Building"
            name="building"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={6}>
              <CippFormComponent
                type="number"
                label="Floor"
                name="floor"
                formControl={formControl}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <CippFormComponent
                type="textField"
                label="Floor Label"
                name="floorLabel"
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Address Fields */}
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Street Address"
            name="street"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          {/* City and Postal Code */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CippFormComponent
                type="textField"
                label="City"
                name="city"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={6}>
              <CippFormComponent
                type="textField"
                label="Postal Code"
                name="postalCode"
                formControl={formControl}
              />
            </Grid>
          </Grid>
          {/* State and Country */}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <CippFormComponent
                type="textField"
                label="State"
                name="state"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={6}>
              <CippFormComponent
                type="autoComplete"
                label="Country/Region"
                name="countryOrRegion"
                multiple={false}
                creatable={false}
                options={countryList.map(({ Code, Name }) => ({
                  label: Name,
                  value: Code,
                }))}
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Room Equipment */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Room Equipment</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Audio Device"
            name="audioDeviceName"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Video Device"
            name="videoDeviceName"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Display Device"
            name="displayDeviceName"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Room Features */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Room Features</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Phone"
            name="phone"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="autoComplete"
            label="Tags"
            name="tags"
            formControl={formControl}
            multiple={true}
            creatable={true}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

EditRoomMailbox.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRoomMailbox; 