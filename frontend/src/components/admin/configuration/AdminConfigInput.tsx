import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { stringToTimespan, timespanToString } from "../../../utils/date.util";
import FileSizeInput from "../../core/FileSizeInput";
import TimespanInput from "../../core/TimespanInput";
import { Input, PasswordInput, Textarea, NumberInput, Switch } from "../../ui";
import { useState, useEffect } from "react";

const AdminConfigInput = ({
  configVariable,
  updateConfigVariable,
}: {
  configVariable: AdminConfig;
  updateConfigVariable: (variable: UpdateConfig) => void;
}) => {
  const [stringValue, setStringValue] = useState(
    configVariable.value ?? configVariable.defaultValue
  );
  const [textValue, setTextValue] = useState(
    configVariable.value ?? configVariable.defaultValue
  );
  const [numberValue, setNumberValue] = useState(
    parseInt(configVariable.value ?? configVariable.defaultValue)
  );
  const [booleanValue, setBooleanValue] = useState(
    (configVariable.value ?? configVariable.defaultValue) == "true"
  );

  useEffect(() => {
    setStringValue(configVariable.value ?? configVariable.defaultValue);
    setTextValue(configVariable.value ?? configVariable.defaultValue);
    setNumberValue(parseInt(configVariable.value ?? configVariable.defaultValue));
    setBooleanValue(
      (configVariable.value ?? configVariable.defaultValue) == "true"
    );
  }, [configVariable.value, configVariable.defaultValue]);

  const onValueChange = (configVariable: AdminConfig, value: any) => {
    if (configVariable.type === "string") {
      setStringValue(value);
    } else if (configVariable.type === "text") {
      setTextValue(value);
    } else if (configVariable.type === "number") {
      setNumberValue(value);
    } else if (configVariable.type === "boolean") {
      setBooleanValue(value);
    }
    updateConfigVariable({ key: configVariable.key, value: value });
  };

  return (
    <div className="flex justify-end w-full">
      {configVariable.type == "string" &&
        (configVariable.obscured ? (
          <PasswordInput
            autoComplete="new-password"
            className="w-full"
            disabled={!configVariable.allowEdit}
            value={stringValue}
            onChange={(e) => onValueChange(configVariable, e.target.value)}
          />
        ) : (
          <Input
            className="w-full"
            disabled={!configVariable.allowEdit}
            value={stringValue}
            placeholder={configVariable.defaultValue}
            onChange={(e) => onValueChange(configVariable, e.target.value)}
          />
        ))}

      {configVariable.type == "text" && (
        <Textarea
          className="w-full"
          disabled={!configVariable.allowEdit}
          value={textValue}
          placeholder={configVariable.defaultValue}
          onChange={(e) => onValueChange(configVariable, e.target.value)}
          rows={4}
        />
      )}
      {configVariable.type == "number" && (
        <NumberInput
          value={numberValue}
          disabled={!configVariable.allowEdit}
          placeholder={configVariable.defaultValue}
          onChange={(number) => onValueChange(configVariable, number)}
          className="w-52"
        />
      )}
      {configVariable.type == "filesize" && (
        <FileSizeInput
          disabled={!configVariable.allowEdit}
          value={parseInt(configVariable.value ?? configVariable.defaultValue)}
          onChange={(bytes) => onValueChange(configVariable, bytes)}
          className="w-52"
        />
      )}
      {configVariable.type == "boolean" && (
        <Switch
          disabled={!configVariable.allowEdit}
          checked={booleanValue}
          onChange={(checked) => onValueChange(configVariable, checked)}
        />
      )}
      {configVariable.type == "timespan" && (
        <TimespanInput
          value={stringToTimespan(configVariable.value)}
          disabled={!configVariable.allowEdit}
          onChange={(timespan) =>
            onValueChange(configVariable, timespanToString(timespan))
          }
          className="w-52"
        />
      )}
    </div>
  );
};

export default AdminConfigInput;
