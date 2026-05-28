import { Button } from "@repo/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@repo/ui/components/command";
import { Input } from "@repo/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/popover";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import type { CountryCode } from "libphonenumber-js/min";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

function toE164PhoneValue(
	value: string | undefined,
	defaultCountry: RPNInput.Country,
): RPNInput.Value | undefined {
	if (value == null) return undefined;
	const trimmed = String(value).trim();
	if (!trimmed) return undefined;
	if (trimmed.startsWith("+")) {
		const parsed = parsePhoneNumberFromString(trimmed);
		return (parsed?.format("E.164") ?? trimmed) as RPNInput.Value;
	}
	const parsed = parsePhoneNumberFromString(
		trimmed,
		defaultCountry.toUpperCase() as CountryCode,
	);
	return parsed?.format("E.164") as RPNInput.Value | undefined;
}

type PhoneInputProps = Omit<
	React.ComponentProps<"input">,
	"onChange" | "value" | "ref"
> &
	Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
		onChange?: (value: RPNInput.Value) => void;
	};

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
	React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
		({ className, onChange, value, defaultCountry = "US", ...props }, ref) => {
			const e164Value = React.useMemo(
				() => toE164PhoneValue(value, defaultCountry),
				[value, defaultCountry],
			);

			return (
				<RPNInput.default
					ref={ref}
					className={cn("flex", className)}
					flagComponent={FlagComponent}
					countrySelectComponent={CountrySelect}
					inputComponent={InputComponent}
					smartCaret={false}
					value={e164Value}
					defaultCountry={defaultCountry}
					/**
					 * Handles the onChange event.
					 *
					 * react-phone-number-input might trigger the onChange event as undefined
					 * when a valid phone number is not entered. To prevent this,
					 * the value is coerced to an empty string.
					 *
					 * @param {E164Number | undefined} value - The entered value
					 */
					onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
					{...props}
				/>
			);
		},
	);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
	<Input className={cn("rounded-s-none", className)} {...props} ref={ref} />
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
	disabled?: boolean;
	value: RPNInput.Country;
	options: CountryEntry[];
	onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
	disabled,
	value: selectedCountry,
	options: countryList,
	onChange,
}: Readonly<CountrySelectProps>) => {
	const scrollAreaRef = React.useRef<HTMLDivElement>(null);
	const [searchValue, setSearchValue] = React.useState("");
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Popover
			open={isOpen}
			modal
			onOpenChange={(open) => {
				setIsOpen(open);
				open && setSearchValue("");
			}}
		>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="flex h-9 gap-1 rounded-e-none rounded-s-md border border-r-0 px-3"
					disabled={disabled}
				>
					<FlagComponent
						country={selectedCountry}
						countryName={selectedCountry}
					/>
					<ChevronsUpDown
						className={cn(
							"-mr-2 size-4 opacity-50",
							disabled ? "hidden" : "opacity-100",
						)}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0">
				<Command>
					<CommandInput
						value={searchValue}
						onValueChange={(value) => {
							setSearchValue(value);
							setTimeout(() => {
								if (scrollAreaRef.current) {
									const viewportElement = scrollAreaRef.current.querySelector(
										"[data-radix-scroll-area-viewport]",
									);
									if (viewportElement) {
										viewportElement.scrollTop = 0;
									}
								}
							}, 0);
						}}
						placeholder="Search country..."
					/>
					<CommandList>
						<ScrollArea ref={scrollAreaRef} className="h-72">
							<CommandEmpty>No country found.</CommandEmpty>
							<CommandGroup>
								{countryList.map(({ value, label }) =>
									value ? (
										<CountrySelectOption
											key={value}
											country={value}
											countryName={label}
											selectedCountry={selectedCountry}
											onChange={onChange}
											onSelectComplete={() => setIsOpen(false)}
										/>
									) : null,
								)}
							</CommandGroup>
						</ScrollArea>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
	selectedCountry: RPNInput.Country;
	onChange: (country: RPNInput.Country) => void;
	onSelectComplete: () => void;
}

const CountrySelectOption = ({
	country,
	countryName,
	selectedCountry,
	onChange,
	onSelectComplete,
}: Readonly<CountrySelectOptionProps>) => {
	const handleSelect = () => {
		onChange(country);
		onSelectComplete();
	};

	return (
		<CommandItem className="gap-2" onSelect={handleSelect}>
			<FlagComponent country={country} countryName={countryName} />
			<span className="flex-1 text-sm">{countryName}</span>
			<span className="text-foreground/50 text-sm">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
			<CheckIcon
				className={`ml-auto size-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`}
			/>
		</CommandItem>
	);
};

const FlagComponent = ({
	country,
	countryName,
}: Readonly<RPNInput.FlagProps>) => {
	const Flag = flags[country];

	return (
		<span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm [&_svg:not([class*='size-'])]:size-full">
			{Flag && <Flag title={countryName} />}
		</span>
	);
};

export { PhoneInput };
