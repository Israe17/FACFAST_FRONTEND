"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import {
  useGenerateVariantsMutation,
  useSetVariantAttributesMutation,
  useVariantAttributesQuery,
} from "../queries";
import type { Product } from "../types";
import { useInventoryModule } from "../use-inventory-module";

type AttributeFormValue = {
  name: string;
  values: string[];
};

type VariantAttributesManagerProps = {
  product: Product;
};

function VariantAttributesManager({ product }: VariantAttributesManagerProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canView = can("variant_attributes.view");
  const canConfigure = can("variant_attributes.configure");
  const canGenerate = can("variant_attributes.generate");

  const attributesQuery = useVariantAttributesQuery(
    product.id,
    canRunTenantQueries && canView,
  );
  const saveAttributesMutation = useSetVariantAttributesMutation(product.id);
  const generateVariantsMutation = useGenerateVariantsMutation(product.id);

  const [editing, setEditing] = useState(false);
  const [attributes, setAttributes] = useState<AttributeFormValue[]>([]);
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({});
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const startEditing = useCallback(() => {
    const existingAttributes = attributesQuery.data ?? [];
    setAttributes(
      existingAttributes.length > 0
        ? existingAttributes.map((attr) => ({
            name: attr.name,
            values: attr.values.map((v) => v.value),
          }))
        : [{ name: "", values: [] }],
    );
    setNewValueInputs({});
    setEditing(true);
  }, [attributesQuery.data]);

  const handleAddAttribute = useCallback(() => {
    setAttributes((prev) => [...prev, { name: "", values: [] }]);
  }, []);

  const handleRemoveAttribute = useCallback((index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAttributeNameChange = useCallback(
    (index: number, name: string) => {
      setAttributes((prev) =>
        prev.map((attr, i) => (i === index ? { ...attr, name } : attr)),
      );
    },
    [],
  );

  const handleAddValue = useCallback(
    (attrIndex: number) => {
      const value = (newValueInputs[attrIndex] ?? "").trim();
      if (!value) return;

      setAttributes((prev) =>
        prev.map((attr, i) =>
          i === attrIndex && !attr.values.some((v) => v.toLowerCase() === value.toLowerCase())
            ? { ...attr, values: [...attr.values, value] }
            : attr,
        ),
      );
      setNewValueInputs((prev) => ({ ...prev, [attrIndex]: "" }));
    },
    [newValueInputs],
  );

  const handleRemoveValue = useCallback(
    (attrIndex: number, valueIndex: number) => {
      setAttributes((prev) =>
        prev.map((attr, i) =>
          i === attrIndex
            ? { ...attr, values: attr.values.filter((_, vi) => vi !== valueIndex) }
            : attr,
        ),
      );
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const payload = attributes
      .filter((attr) => attr.name.trim() && attr.values.length > 0)
      .map((attr, index) => ({
        name: attr.name.trim(),
        display_order: index,
        values: attr.values.map((value, vi) => ({
          value,
          display_order: vi,
        })),
      }));

    await saveAttributesMutation.mutateAsync(payload);
    setEditing(false);
  }, [attributes, saveAttributesMutation]);

  const handleGenerateClick = useCallback(() => {
    const existingVariants = product.variants ?? [];
    const nonDefaultCount = existingVariants.filter((v) => !v.is_default).length;
    if (nonDefaultCount > 0) {
      setShowGenerateConfirm(true);
    } else {
      generateVariantsMutation.mutateAsync();
    }
  }, [product.variants, generateVariantsMutation]);

  const handleGenerateConfirm = useCallback(async () => {
    await generateVariantsMutation.mutateAsync();
    setShowGenerateConfirm(false);
  }, [generateVariantsMutation]);

  const existingAttributes = attributesQuery.data ?? [];

  if (!canView && !canConfigure && !canGenerate) {
    return null;
  }

  if (editing) {
    return (
      <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
        <div className="space-y-1">
          <h4 className="font-semibold">{t("inventory.variants.define_attributes")}</h4>
          <p className="text-sm text-muted-foreground">
            {t("inventory.variants.define_attributes_description")}
          </p>
        </div>

        {attributes.map((attr, attrIndex) => (
          <div
            key={attrIndex}
            className="space-y-3 rounded-lg border border-border/50 p-3"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label>{t("inventory.variants.attribute_name")}</Label>
                <Input
                  placeholder={t("inventory.variants.attribute_name_placeholder")}
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeNameChange(attrIndex, e.target.value)
                  }
                />
              </div>
              {attributes.length > 1 ? (
                <Button
                  className="mt-6"
                  onClick={() => handleRemoveAttribute(attrIndex)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>{t("inventory.variants.attribute_values")}</Label>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((value, valueIndex) => (
                  <Badge
                    key={valueIndex}
                    className="cursor-pointer"
                    variant="secondary"
                    onClick={() => handleRemoveValue(attrIndex, valueIndex)}
                  >
                    {value} &times;
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={t("inventory.variants.add_value_placeholder")}
                  value={newValueInputs[attrIndex] ?? ""}
                  onChange={(e) =>
                    setNewValueInputs((prev) => ({
                      ...prev,
                      [attrIndex]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddValue(attrIndex);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAddValue(attrIndex)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={handleAddAttribute} size="sm" variant="outline">
            <Plus className="mr-1 size-4" />
            {t("inventory.variants.add_attribute")}
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setEditing(false)} size="sm" variant="ghost">
            {t("common.cancel")}
          </Button>
          <ActionButton
            isLoading={saveAttributesMutation.isPending}
            loadingText={t("common.saving")}
            onClick={handleSave}
            size="sm"
          >
            {t("inventory.variants.save_attributes")}
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold">{t("inventory.variants.attributes_title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("inventory.variants.attributes_description")}
            </p>
          </div>
          <div className="flex gap-2">
            {canConfigure ? (
              <Button onClick={startEditing} size="sm" variant="outline">
                {existingAttributes.length > 0
                  ? t("inventory.variants.edit_attributes")
                  : t("inventory.variants.define_attributes")}
              </Button>
            ) : null}
            {canGenerate && existingAttributes.length > 0 ? (
              <ActionButton
                icon={Wand2}
                isLoading={generateVariantsMutation.isPending}
                loadingText={t("inventory.variants.generating")}
                onClick={handleGenerateClick}
                size="sm"
                variant="outline"
              >
                {t("inventory.variants.generate_variants")}
              </ActionButton>
            ) : null}
          </div>
        </div>

        {existingAttributes.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {existingAttributes.map((attr) => (
              <div key={attr.id} className="space-y-1">
                <p className="text-sm font-medium">{attr.name}</p>
                <div className="flex flex-wrap gap-1">
                  {attr.values.map((value) => (
                    <Badge key={value.id} variant="outline">
                      {value.value}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("inventory.variants.no_attributes_defined")}
          </p>
        )}
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setShowGenerateConfirm(false);
        }}
        open={showGenerateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.variants.generate_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.variants.generate_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateConfirm}>
              {t("inventory.variants.generate_confirm_action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { VariantAttributesManager };
