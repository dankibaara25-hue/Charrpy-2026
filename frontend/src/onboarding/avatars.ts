// Avatar roster for Charrpy. require()'d at module load so Metro bundles
// all 19 assets up front — no dynamic strings allowed in require().

import { ImageSourcePropType } from "react-native";

export interface Avatar {
  id: string;
  source: ImageSourcePropType;
}

export const AVATARS: Avatar[] = [
  { id: "a01", source: require("../../assets/images/avatars/01.png") },
  { id: "a02", source: require("../../assets/images/avatars/02.jpg") },
  { id: "a03", source: require("../../assets/images/avatars/03.jpg") },
  { id: "a04", source: require("../../assets/images/avatars/04.png") },
  { id: "a05", source: require("../../assets/images/avatars/05.jpg") },
  { id: "a06", source: require("../../assets/images/avatars/06.png") },
  { id: "a07", source: require("../../assets/images/avatars/07.png") },
  { id: "a08", source: require("../../assets/images/avatars/08.png") },
  { id: "a09", source: require("../../assets/images/avatars/09.png") },
  { id: "a10", source: require("../../assets/images/avatars/10.png") },
  { id: "a11", source: require("../../assets/images/avatars/11.png") },
  { id: "a12", source: require("../../assets/images/avatars/12.png") },
  { id: "a13", source: require("../../assets/images/avatars/13.png") },
  { id: "a14", source: require("../../assets/images/avatars/14.png") },
  { id: "a15", source: require("../../assets/images/avatars/15.png") },
  { id: "a16", source: require("../../assets/images/avatars/16.png") },
  { id: "a17", source: require("../../assets/images/avatars/17.png") },
  { id: "a18", source: require("../../assets/images/avatars/18.png") },
  { id: "a19", source: require("../../assets/images/avatars/19.png") },
];

export const findAvatar = (id?: string | null): Avatar | undefined =>
  id ? AVATARS.find((a) => a.id === id) : undefined;
