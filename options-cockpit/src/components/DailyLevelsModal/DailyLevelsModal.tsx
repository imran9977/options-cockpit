import { useEffect, useState } from "react";
import "./DailyLevelsModal.css";
import type { DailyLevels } from "../../models/DailyLevel";
import {getDailyLevels,saveDailyLevels,} from "../../services/dailyLevelsStorage";

interface DailyLevelsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type LevelField =
    | "primarySupport"
    | "secondarySupport"
    | "primaryResistance"
    | "secondaryResistance";

export default function DailyLevelsModal({
    isOpen,
    onClose,
}: DailyLevelsModalProps) {

    const createEmptyLevels = (): DailyLevels => ({
        date: new Date().toISOString().split("T")[0],
        nifty: {
            primarySupport: null,
            secondarySupport: null,
            primaryResistance: null,
            secondaryResistance: null,
        },
        sensex: {
            primarySupport: null,
            secondarySupport: null,
            primaryResistance: null,
            secondaryResistance: null,
        },
    });

    const [activeTab, setActiveTab] =
        useState<"nifty" | "sensex">("nifty");

    const [levels, setLevels] =
        useState<DailyLevels>(createEmptyLevels());

    const [savedLevels, setSavedLevels] =
        useState<DailyLevels | null>(null);

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    const [isEditing, setIsEditing] =
        useState(true);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [lastUpdated, setLastUpdated] =
        useState("");

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const storedLevels = getDailyLevels();

        if (storedLevels) {

            setLevels(storedLevels);
            setSavedLevels(storedLevels);
            setIsEditing(false);
            setErrors({});

            setLastUpdated(
                new Date().toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })
            );

        } else {

            const empty = createEmptyLevels();

            setLevels(empty);
            setSavedLevels(null);
            setErrors({});
            setIsEditing(true);
            setLastUpdated("");
        }

    }, [isOpen]);

    const validateTab = (
        tab: "nifty" | "sensex"
    ): boolean => {

        const current = levels[tab];

        const newErrors: Record<string, string> = {};

        if (current.primarySupport === null) {
            newErrors.primarySupport =
                "Primary Support is required.";
        }

        if (current.secondarySupport === null) {
            newErrors.secondarySupport =
                "Secondary Support is required.";
        }

        if (current.primaryResistance === null) {
            newErrors.primaryResistance =
                "Primary Resistance is required.";
        }

        if (current.secondaryResistance === null) {
            newErrors.secondaryResistance =
                "Secondary Resistance is required.";
        }

        if (
            current.primarySupport !== null &&
            current.secondarySupport !== null &&
            current.secondarySupport >= current.primarySupport
        ) {
            newErrors.secondarySupport =
                "Secondary Support must be below Primary Support.";
        }

        if (
            current.primaryResistance !== null &&
            current.secondaryResistance !== null &&
            current.secondaryResistance <= current.primaryResistance
        ) {
            newErrors.secondaryResistance =
                "Secondary Resistance must be above Primary Resistance.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const updateLevel = (
        field: LevelField,
        value: string
    ) => {

        const numericValue =
            value === "" ? null : Number(value);

        setLevels((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: numericValue,
            },
        }));

        if (Object.keys(errors).length) {

            setTimeout(() => {
                validateTab(activeTab);
            }, 0);

        }
    };

    const handleSave = () => {

        if (!validateTab(activeTab)) {
            return;
        }

        saveDailyLevels(levels);

        setSavedLevels(levels);
        setIsEditing(false);

        setLastUpdated(
            new Date().toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        );

        setSuccessMessage(
            "✓ Daily Levels saved successfully."
        );

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
 onClose(); 
    };

    const handleCancel = () => {

        if (savedLevels) {
            setLevels(savedLevels);
        }

        setErrors({});
        setIsEditing(false);
        onClose();
    };

    if (!isOpen) {
        return null;
    }
return (
    <div className="daily-levels-backdrop">
        <div className="daily-levels-modal">

            <div className="daily-levels-header">
                <h2>Daily Market Levels</h2>

                <button
                    className="daily-levels-close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            {savedLevels && !isEditing && (
                <div className="daily-levels-banner">
                    <span>
                        📌 Levels updated {lastUpdated}
                    </span>

                    <button
                        type="button"
                        className="edit-levels-button"
                        onClick={() => setIsEditing(true)}
                    >
                        ✏️ Edit
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="daily-levels-success">
                    {successMessage}
                </div>
            )}

            <div className="daily-levels-tabs">
                <button
                    className={activeTab === "nifty" ? "active" : ""}
                    onClick={() => {
                        setErrors({});
                        setActiveTab("nifty");
                    }}
                >
                    Nifty
                </button>

                {/* <button
                    className={activeTab === "sensex" ? "active" : ""}
                    onClick={() => {
                        setErrors({});
                        setActiveTab("sensex");
                    }}
                >
                    Sensex
                </button> */}
            </div>

            <div className="daily-levels-form">

                <div className="form-group">
                    <label>Primary Support</label>

                    <input
                        type="number"
                        placeholder="Enter value"
                        disabled={!isEditing}
                        value={
                            levels[activeTab].primarySupport ?? ""
                        }
                        onChange={(e) =>
                            updateLevel(
                                "primarySupport",
                                e.target.value
                            )
                        }
                    />

                    {errors.primarySupport && (
                        <span className="field-error">
                            {errors.primarySupport}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Secondary Support</label>

                    <input
                        type="number"
                        placeholder="Enter value"
                        disabled={!isEditing}
                        value={
                            levels[activeTab].secondarySupport ?? ""
                        }
                        onChange={(e) =>
                            updateLevel(
                                "secondarySupport",
                                e.target.value
                            )
                        }
                    />

                    {errors.secondarySupport && (
                        <span className="field-error">
                            {errors.secondarySupport}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Primary Resistance</label>

                    <input
                        type="number"
                        placeholder="Enter value"
                        disabled={!isEditing}
                        value={
                            levels[activeTab].primaryResistance ?? ""
                        }
                        onChange={(e) =>
                            updateLevel(
                                "primaryResistance",
                                e.target.value
                            )
                        }
                    />

                    {errors.primaryResistance && (
                        <span className="field-error">
                            {errors.primaryResistance}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Secondary Resistance</label>

                    <input
                        type="number"
                        placeholder="Enter value"
                        disabled={!isEditing}
                        value={
                            levels[activeTab].secondaryResistance ?? ""
                        }
                        onChange={(e) =>
                            updateLevel(
                                "secondaryResistance",
                                e.target.value
                            )
                        }
                    />

                    {errors.secondaryResistance && (
                        <span className="field-error">
                            {errors.secondaryResistance}
                        </span>
                    )}
                </div>

            </div>

            <div className="daily-levels-footer">

                <button onClick={handleCancel}>
                    Cancel
                </button>

                {isEditing && (
                    <button
                        onClick={handleSave}
                    >
                        Save
                    </button>
                )}

            </div>

        </div>
    </div>
);
}