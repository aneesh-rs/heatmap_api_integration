import { TFunction } from "i18next";
import Select, { SingleValue, StylesConfig } from "react-select";
import "flag-icons/css/flag-icons.min.css";
import { useTranslation } from "react-i18next";

type Option = {
  value: string;
  label: string;
  flag: string;
};

const options: Option[] = [
  { value: "en", label: "English", flag: "fi fi-us" },
  { value: "es", label: "Spanish", flag: "fi fi-es" },
  { value: "ca", label: "Catalan", flag: "fi fi-es-ct" },
];

type Props = {
  changeLanguage: (lng: string) => Promise<TFunction<"translation", undefined>>;
};

const customStyles: StylesConfig<Option, false> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    color: "#ffffff",
    boxShadow: "none",
    minHeight: "2.5rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#f9fafb",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#007AFF",
    color: "#f9fafb",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#374151" : "#111827",
    color: "#f9fafb",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }),
  input: (provided) => ({
    ...provided,
    color: "#f9fafb",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#9ca3af",
  }),
};

export default function LanguageSwitcher({ changeLanguage }: Props) {
  const { i18n } = useTranslation();

  // Get current language from i18n
  const currentLanguage = i18n.language;

  // Find the current option based on the current language
  const currentOption =
    options.find((option) => option.value === currentLanguage) || options[0];

  const handleChange = (selectedOption: SingleValue<Option>) => {
    if (selectedOption) {
      changeLanguage(selectedOption.value);
    }
  };

  return (
    <div className="flex items-center text-white">
      <Select
        styles={customStyles}
        options={options}
        value={currentOption} // Use value instead of defaultValue
        onChange={handleChange}
        className="w-44"
        isSearchable={false}
        formatOptionLabel={({ label, flag }) => (
          <div className="flex items-center gap-2">
            <span className="text-lg">
              <span className={flag}></span>
            </span>
            <span>{label}</span>
          </div>
        )}
      />
    </div>
  );
}
