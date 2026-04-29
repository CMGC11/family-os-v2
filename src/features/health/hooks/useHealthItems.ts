import { useCallback, useEffect, useState } from "react";
import { requireSupabaseClient } from "../../../lib/supabase/client";
import { getCurrentHouseholdId } from "../../../lib/supabase/household";
import {
  deleteAllergy,
  deleteMedication,
  fetchAllergies,
  fetchMedications,
  insertAllergy,
  insertMedication,
  updateAllergy,
  updateMedication,
} from "../services/healthSupabaseService";
import type { Allergy, Medication } from "../types";

export function useHealthItems() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const refreshItems = useCallback(async () => {
    const [nextAllergies, nextMedications] = await Promise.all([
      fetchAllergies(),
      fetchMedications(),
    ]);
    setAllergies(nextAllergies);
    setMedications(nextMedications);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const [nextAllergies, nextMedications] = await Promise.all([
          fetchAllergies(),
          fetchMedications(),
        ]);

        if (!cancelled) {
          setAllergies(nextAllergies);
          setMedications(nextMedications);
        }
      } catch (error) {
        console.error("Failed to load health profile items:", error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load allergies and medications.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = requireSupabaseClient();
    let allergiesChannel: ReturnType<typeof supabase.channel> | null = null;
    let medicationsChannel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      try {
        const householdId = await getCurrentHouseholdId();
        if (cancelled) return;

        allergiesChannel = supabase
          .channel(`allergies-realtime-${householdId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "allergies",
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                await refreshItems();
              } catch (error) {
                console.error(
                  "Failed to refresh allergies after realtime event:",
                  error,
                );
              }
            },
          )
          .subscribe();

        medicationsChannel = supabase
          .channel(`medications-realtime-${householdId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "medications",
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                await refreshItems();
              } catch (error) {
                console.error(
                  "Failed to refresh medications after realtime event:",
                  error,
                );
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error("Failed to subscribe to health profile realtime:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to subscribe to health sync.",
        );
      }
    }

    subscribe();

    return () => {
      cancelled = true;
      if (allergiesChannel) supabase.removeChannel(allergiesChannel);
      if (medicationsChannel) supabase.removeChannel(medicationsChannel);
    };
  }, [refreshItems]);

  async function addAllergy(
    name: string,
    severity: string,
    notes: string,
    personId?: string,
  ): Promise<Allergy | null> {
    const cleanName = name.trim();
    if (!cleanName) return null;

    try {
      setErrorMessage("");
      const newAllergy = await insertAllergy(
        cleanName,
        severity.trim() || "moderate",
        notes.trim(),
        personId,
      );
      setAllergies((current) => [
        newAllergy,
        ...current.filter((item) => item.id !== newAllergy.id),
      ]);
      return newAllergy;
    } catch (error) {
      console.error("Failed to insert allergy:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to add allergy.",
      );
      return null;
    }
  }

  async function editAllergy(
    id: string,
    name: string,
    severity: string,
    notes: string,
  ): Promise<Allergy | null> {
    const cleanName = name.trim();
    if (!cleanName) return null;

    try {
      setErrorMessage("");
      const updatedAllergy = await updateAllergy(
        id,
        cleanName,
        severity.trim() || "moderate",
        notes.trim(),
      );
      setAllergies((current) =>
        current.map((item) =>
          item.id === updatedAllergy.id ? updatedAllergy : item,
        ),
      );
      return updatedAllergy;
    } catch (error) {
      console.error("Failed to update allergy:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update allergy.",
      );
      return null;
    }
  }

  async function removeAllergy(id: string) {
    const previousAllergies = allergies;
    setAllergies((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage("");
      await deleteAllergy(id);
    } catch (error) {
      console.error("Failed to delete allergy:", error);
      setAllergies(previousAllergies);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete allergy.",
      );
    }
  }

  async function addMedication(
    name: string,
    dosage: string,
    frequency: string,
    notes: string,
    personId?: string,
  ): Promise<Medication | null> {
    const cleanName = name.trim();
    if (!cleanName) return null;

    try {
      setErrorMessage("");
      const newMedication = await insertMedication(
        cleanName,
        dosage.trim(),
        frequency.trim(),
        notes.trim(),
        personId,
      );
      setMedications((current) => [
        newMedication,
        ...current.filter((item) => item.id !== newMedication.id),
      ]);
      return newMedication;
    } catch (error) {
      console.error("Failed to insert medication:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to add medication.",
      );
      return null;
    }
  }

  async function editMedication(
    id: string,
    name: string,
    dosage: string,
    frequency: string,
    notes: string,
  ): Promise<Medication | null> {
    const cleanName = name.trim();
    if (!cleanName) return null;

    try {
      setErrorMessage("");
      const updatedMedication = await updateMedication(
        id,
        cleanName,
        dosage.trim(),
        frequency.trim(),
        notes.trim(),
      );
      setMedications((current) =>
        current.map((item) =>
          item.id === updatedMedication.id ? updatedMedication : item,
        ),
      );
      return updatedMedication;
    } catch (error) {
      console.error("Failed to update medication:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update medication.",
      );
      return null;
    }
  }

  async function removeMedication(id: string) {
    const previousMedications = medications;
    setMedications((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage("");
      await deleteMedication(id);
    } catch (error) {
      console.error("Failed to delete medication:", error);
      setMedications(previousMedications);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete medication.",
      );
    }
  }

  return {
    allergies,
    medications,
    isLoading,
    errorMessage,
    addAllergy,
    editAllergy,
    removeAllergy,
    addMedication,
    editMedication,
    removeMedication,
  };
}
