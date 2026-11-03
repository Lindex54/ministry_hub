"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

// Uganda's administrative location hierarchy (district -> county -> sub-county
// -> parish -> village). Every level is optional — choosing a parent just
// narrows the next dropdown's options; nothing here is required.
export function UgandaLocationFields({ control, watch, setValue, prefix = "" }) {
  const field = (name) => `${prefix}${name}`;
  const districtId = watch(field("districtId"));
  const countyId = watch(field("countyId"));
  const subCountyId = watch(field("subCountyId"));
  const parishId = watch(field("parishId"));

  const [districts, setDistricts] = useState([]);
  const [counties, setCounties] = useState([]);
  const [subCounties, setSubCounties] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [villages, setVillages] = useState([]);

  useEffect(() => { api("/locations/districts").then(setDistricts).catch(() => {}); }, []);

  useEffect(() => {
    if (!districtId) { setCounties([]); return; }
    api(`/locations/districts/${districtId}/counties`).then(setCounties).catch(() => setCounties([]));
  }, [districtId]);

  useEffect(() => {
    if (!countyId) { setSubCounties([]); return; }
    api(`/locations/counties/${countyId}/sub-counties`).then(setSubCounties).catch(() => setSubCounties([]));
  }, [countyId]);

  useEffect(() => {
    if (!subCountyId) { setParishes([]); return; }
    api(`/locations/sub-counties/${subCountyId}/parishes`).then(setParishes).catch(() => setParishes([]));
  }, [subCountyId]);

  useEffect(() => {
    if (!parishId) { setVillages([]); return; }
    api(`/locations/parishes/${parishId}/villages`).then(setVillages).catch(() => setVillages([]));
  }, [parishId]);

  function selectDistrict(value) {
    setValue(field("districtId"), value);
    setValue(field("countyId"), "");
    setValue(field("subCountyId"), "");
    setValue(field("parishId"), "");
    setValue(field("villageId"), "");
  }

  function selectCounty(value) {
    setValue(field("countyId"), value);
    setValue(field("subCountyId"), "");
    setValue(field("parishId"), "");
    setValue(field("villageId"), "");
  }

  function selectSubCounty(value) {
    setValue(field("subCountyId"), value);
    setValue(field("parishId"), "");
    setValue(field("villageId"), "");
  }

  function selectParish(value) {
    setValue(field("parishId"), value);
    setValue(field("villageId"), "");
  }

  return (
    <>
      <Field>
        <FieldLabel htmlFor="location-district">District</FieldLabel>
        <Controller name={field("districtId")} control={control} render={({ field: formField }) => (
          <Select value={formField.value || undefined} onValueChange={selectDistrict}>
            <SelectTrigger id="location-district" className="w-full"><SelectValue placeholder="Select district" /></SelectTrigger>
            <SelectContent>{districts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </Field>
      <Field>
        <FieldLabel htmlFor="location-county">County</FieldLabel>
        <Controller name={field("countyId")} control={control} render={({ field: formField }) => (
          <Select value={formField.value || undefined} onValueChange={selectCounty} disabled={!districtId}>
            <SelectTrigger id="location-county" className="w-full"><SelectValue placeholder={districtId ? "Select county" : "Select a district first"} /></SelectTrigger>
            <SelectContent>{counties.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </Field>
      <Field>
        <FieldLabel htmlFor="location-sub-county">Sub-county</FieldLabel>
        <Controller name={field("subCountyId")} control={control} render={({ field: formField }) => (
          <Select value={formField.value || undefined} onValueChange={selectSubCounty} disabled={!countyId}>
            <SelectTrigger id="location-sub-county" className="w-full"><SelectValue placeholder={countyId ? "Select sub-county" : "Select a county first"} /></SelectTrigger>
            <SelectContent>{subCounties.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </Field>
      <Field>
        <FieldLabel htmlFor="location-parish">Parish</FieldLabel>
        <Controller name={field("parishId")} control={control} render={({ field: formField }) => (
          <Select value={formField.value || undefined} onValueChange={selectParish} disabled={!subCountyId}>
            <SelectTrigger id="location-parish" className="w-full"><SelectValue placeholder={subCountyId ? "Select parish" : "Select a sub-county first"} /></SelectTrigger>
            <SelectContent>{parishes.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </Field>
      <Field>
        <FieldLabel htmlFor="location-village">Village</FieldLabel>
        <Controller name={field("villageId")} control={control} render={({ field: formField }) => (
          <Select value={formField.value || undefined} onValueChange={(value) => setValue(field("villageId"), value)} disabled={!parishId}>
            <SelectTrigger id="location-village" className="w-full"><SelectValue placeholder={parishId ? "Select village" : "Select a parish first"} /></SelectTrigger>
            <SelectContent>{villages.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </Field>
    </>
  );
}
