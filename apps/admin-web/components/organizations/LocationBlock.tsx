"use client";

import { validateImageFile } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LOCATION_TYPE_OPTIONS } from "@/constants/organization";
import { addOrganizationSchemaBase } from "@/schemas/organization.schema";

const LOGO_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

export type LocationBlockForm = {
	Field: (props: {
		name: string;
		mode?: "array";
		validators?: { onChange?: unknown };
		children: (field: {
			state: {
				value: string;
				meta: { isTouched: boolean; isValid: boolean; errors?: string[] };
			};
			name: string;
			handleChange: (value: string) => void;
			handleBlur: () => void;
		}) => React.ReactNode;
	}) => React.ReactNode;
};

type LocationBlockProps = {
	form: LocationBlockForm;
	index: number;
	onRemove: () => void;
	canRemove: boolean;
	isPending?: boolean;
};

export function LocationBlock({
	form,
	index,
	onRemove,
	canRemove,
	isPending = false,
}: LocationBlockProps) {
	const prefix = `locations[${index}]` as const;
	const photoInputRef = useRef<HTMLInputElement>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);

	const handlePhotoClick = () => photoInputRef.current?.click();
	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (isPending) return;
		const file = e.target.files?.[0];
		if (!file) return;
		const err = validateImageFile(file, "Location photo");
		if (err) {
			toast.error(err);
			return;
		}
		setPhotoFile(file);
		const reader = new FileReader();
		reader.onload = () => setPhotoPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	const locationValidators =
		addOrganizationSchemaBase.shape.locations.element.shape;

	return (
		<div className="space-y-4 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Location {index + 1}</span>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-destructive hover:bg-destructive/10"
						disabled={isPending}
						onClick={onRemove}
					>
						<Trash2 className="size-4" data-icon="inline-start" />
						Remove
					</Button>
				)}
			</div>
			<FieldGroup>
				<form.Field
					name={`${prefix}.locationName`}
					validators={{ onChange: locationValidators.locationName }}
				>
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>
									Location Name <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									placeholder="e.g. Headquarters"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field
					name={`${prefix}.address`}
					validators={{ onChange: locationValidators.address }}
				>
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>
									Address <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									placeholder="Street address"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<div className="grid gap-4 sm:grid-cols-3">
					<form.Field
						name={`${prefix}.city`}
						validators={{ onChange: locationValidators.city }}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										City <RequiredStar />
									</FieldLabel>
									<Input
										id={field.name}
										placeholder="City"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={`${prefix}.state`}
						validators={{ onChange: locationValidators.state }}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										State <RequiredStar />
									</FieldLabel>
									<Input
										id={field.name}
										placeholder="State"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={`${prefix}.zipCode`}
						validators={{ onChange: locationValidators.zipCode }}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										ZIP Code <RequiredStar />
									</FieldLabel>
									<Input
										id={field.name}
										placeholder="ZIP"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>

				<form.Field
					name={`${prefix}.locationType`}
					validators={{ onChange: locationValidators.locationType }}
				>
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>
									Location Type <RequiredStar />
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger
										id={field.name}
										className="w-full"
										aria-invalid={isInvalid}
									>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{LOCATION_TYPE_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name={`${prefix}.phone`}>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Phone</FieldLabel>
									<PhoneInput
										id={field.name}
										name={field.name}
										placeholder="+19876543210"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(value) => field.handleChange(value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={`${prefix}.email`}
						validators={{ onChange: locationValidators.email }}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email</FieldLabel>
									<Input
										id={field.name}
										type="email"
										placeholder="location@example.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>

				<form.Field name={`${prefix}.costCenter`}>
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Cost Center</FieldLabel>
							<Input
								id={field.name}
								placeholder="Cost center"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</Field>
					)}
				</form.Field>

				<div className="space-y-2">
					<FieldLabel>Location Photo</FieldLabel>
					<div className="flex items-center gap-4">
						{photoPreview ? (
							<Image
								src={photoPreview}
								alt="Location"
								width={64}
								height={64}
								className="size-16 rounded-lg object-cover"
								unoptimized
							/>
						) : (
							<div className="flex size-16 items-center justify-center rounded-lg border border-dashed bg-muted/50">
								<ImagePlus className="text-muted-foreground size-6" />
							</div>
						)}
						<input
							ref={photoInputRef}
							type="file"
							accept={LOGO_ACCEPT}
							className="hidden"
							onChange={handlePhotoChange}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isPending}
							onClick={handlePhotoClick}
						>
							<ImagePlus className="size-4" data-icon="inline-start" />
							{photoFile ? "Replace Photo" : "Upload Photo"}
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">PNG, JPG — max 2MB</p>
				</div>
			</FieldGroup>
		</div>
	);
}
