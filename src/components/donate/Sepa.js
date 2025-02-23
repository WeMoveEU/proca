import React, { useState } from "react";

import { Container, Grid } from "@material-ui/core";
import { Box, Button, Snackbar } from "@material-ui/core";
import useElementWidth from "../../hooks/useElementWidth";
import Url from "../../lib/urlparser.js";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";

import TextField from "../TextField";

import DoneIcon from "@material-ui/icons/Done";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { addActionContact } from "../../lib/server.js";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%",
  },
}));

export default function Register(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data, setData] = useData();
  const { t } = useTranslation();

  const width = useElementWidth("#proca-sepa");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const [status, setStatus] = useState("default");
  const form = useForm({
    defaultValues: data,
  });
  const { trigger, handleSubmit, setError, formState, getValues } = form;
  //  const { register, handleSubmit, setValue, errors } = useForm({ mode: 'onBlur', defaultValues: defaultValues });
  //const values = getValues() || {};
  const onSubmit = async (data) => {
    data.tracking = Url.utm();
    const result = await addActionContact(
      config.test ? "test" : config.component?.register?.actionType || "donate",
      config.actionPage,
      data
    );
    if (result.errors) {
      let handled = false;
      console.log(result.errors.fields, data);
      if (result.errors.fields) {
        result.errors.fields.forEach((field) => {
          if (field.name in data) {
            setError(field.name, { type: "server", message: field.message });
            handled = true;
          } else if (field.name.toLowerCase() in data) {
            setError(field.name.toLowerCase(), {
              type: "server",
              message: field.message,
            });
            handled = true;
          }
        });
      }
      !handled && setStatus("error");
      return;
    }
    setStatus("success");
    setData(data);
    props.done &&
      props.done({
        errors: result.errors,
        uuid: result.contactRef,
        firstname: data.firstname,
      });
  };

  return (
    <form
      className={classes.container}
      id="proca-sepa"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <Container component="main" maxWidth="sm">
        <Box marginBottom={1}>
          <h3>
            {t("I'm donating") + " " + data.amount + data.currency?.symbol}
          </h3>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <TextField
                form={form}
                name="firstname"
                label={t("First name")}
                placeholder="eg. Leonardo"
                autoComplete="given-name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <TextField
                form={form}
                name="lastname"
                label={t("Last name")}
                autoComplete="family-name"
                required
                placeholder="eg. Da Vinci"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                form={form}
                name="email"
                type="email"
                label={t("Email")}
                autoComplete="email"
                required
                placeholder="your.email@example.org"
              />
            </Grid>
            {config.component?.donate?.field?.phone === true && (
              <Grid item xs={12}>
                <TextField form={form} name="phone" label={t("Phone")} />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField form={form} name="IBAN" fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                size="large"
                startIcon={<LockIcon />}
              >
                {t("Donate")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </form>
  );
}
