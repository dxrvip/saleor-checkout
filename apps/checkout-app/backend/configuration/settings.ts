import { mapMetadataToSettings } from "@/frontend/utils";
import {
  ChannelDocument,
  ChannelQuery,
  ChannelQueryVariables,
  ChannelsDocument,
  ChannelsQuery,
  ChannelsQueryVariables,
  PrivateMetadataDocument,
  PrivateMetadataQuery,
  PrivateMetadataQueryVariables,
} from "@/graphql";
import { client } from "@/graphql/client";
import { defaultActiveChannelPaymentProviders } from "config/defaults";
import { ChannelActivePaymentProviders } from "types/api";
import { mergeChannelsWithPaymentProvidersSettings } from "./utils";

export const getSettings = async () => {
  const { data, error } = await client
    .query<PrivateMetadataQuery, PrivateMetadataQueryVariables>(
      PrivateMetadataDocument,
      { id: process.env.SALEOR_APP_ID! }
    )
    .toPromise();

  console.log(data, error);

  if (error) {
    throw error;
  }

  const settingsValues = mapMetadataToSettings(
    data?.app?.privateMetadata || []
  );

  return settingsValues;
};

export const getActivePaymentProvidersSettings = async () => {
  const settings = await getSettings();

  const { data, error } = await client
    .query<ChannelsQuery, ChannelsQueryVariables>(ChannelsDocument)
    .toPromise();

  console.log(data, error);

  if (error) {
    throw error;
  }

  const activePaymentProvidersSettings =
    mergeChannelsWithPaymentProvidersSettings(settings, data?.channels);

  return activePaymentProvidersSettings;
};

export const getChannelActivePaymentProvidersSettings = async (
  channelId: string
) => {
  const settings = await getSettings();

  const { data, error } = await client
    .query<ChannelQuery, ChannelQueryVariables>(ChannelDocument, {
      id: channelId,
    })
    .toPromise();

  console.log(data, error);

  if (error) {
    throw error;
  }

  const channelActivePaymentProvidersSettings =
    settings.channelActivePaymentProviders?.[channelId] ||
    defaultActiveChannelPaymentProviders;

  return channelActivePaymentProvidersSettings;
};
