import React from "react";

//import { Container, Grid } from "@material-ui/core";

import {
  IconButton,
  //  ButtonGroup,
  Button,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia,
} from "@material-ui/core";

import metadataparser from "page-metadata-parser";
import uuid from "../lib/uuid";
import { addAction } from "../lib/server";
import Url from "../lib/urlparser";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "../hooks/useConfig";
import SkipNextIcon from "@material-ui/icons/SkipNext";

import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  //  InstapaperShareButton,
  //  LineShareButton,
  LinkedinShareButton,
  //  LivejournalShareButton,
  //  MailruShareButton,
  //  OKShareButton,
  //  PinterestShareButton,
  //  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
  //  TumblrShareButton,
  TwitterShareButton,
  //  ViberShareButton,
  //  VKShareButton,
  WhatsappShareButton,
  //  WorkplaceShareButton,
  FacebookIcon,
  FacebookMessengerIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  media: {
    height: 0,
    paddingTop: "52.5%", // FB ratio
  },
  aamargin: {
    margin: theme.spacing(1),
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  root: {
    "& p": { fontSize: theme.typography.pxToRem(16) },
    "& h3": { fontSize: theme.typography.pxToRem(20) },
  },
  next: {
    margin: theme.spacing(1),
  },
  widroot: {
    "& Button": { justifyContent: "left" },
    "& span": { justifyContent: "left", padding: "5px 10px" },
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));
/*
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
*/

export default function ShareAction(props) {
  const classes = useStyles();
  const config = useCampaignConfig();

  const actionPage = config.actionPage;
  const metadata = metadataparser.getMetadata(window.document, window.location);
  const { t } = useTranslation();

  const shareUrl = (component) => {
    if (config?.component?.share?.utm === false) return window.location.href;

    const url = new URL(window.location.href);
    let params = url.searchParams;
    params.set("utm_source", "share");
    params.set(
      "utm_medium",
      component.render.displayName.replace("ShareButton-", "")
    );
    params.set("utm_campaign", uuid());

    return url.toString();
  };
  const next = () => {
    if (props.done instanceof Function) props.done();
  };

  return (
    <div className={classes.root}>
      <h3>{t("share.title")}</h3>
      <p>{t("share.intro")}</p>
      <Card className={classes.root}>
        {config.component.share?.top && <Actions {...props} />}
        <CardHeader title={metadata.title} subheader={metadata.provider} />
        {metadata.image ? (
          <CardMedia
            className={classes.media}
            image={metadata.image}
            title={metadata.title}
          />
        ) : null}
        <CardContent>
          <p>{metadata.description}</p>
          {!config.component.share?.top && <Actions {...props} />}
        </CardContent>
        {config.component.share?.next && (
          <Button
            endIcon={<SkipNextIcon />}
            className={classes.next}
            variant="contained"
            color="primary"
            onClick={next}
          >
            {t("Next")}
          </Button>
        )}
      </Card>
    </div>
  );

  function Actions(props) {
    const shareText = (key) => {
      return config.param.locales[key] || config.param.locales["share"];
    };
    return (
      <CardActions>
        <ActionIcon
          icon={WhatsappIcon}
          title={shareText("share-whatsapp")}
          windowWidth={715}
          windowHeight={544}
          component={WhatsappShareButton}
        />
        <ActionIcon
          icon={FacebookMessengerIcon}
          title={shareText("share-fbmessenger")}
          appId="634127320642564"
          component={FacebookMessengerShareButton}
        />
        <ActionIcon icon={FacebookIcon} component={FacebookShareButton} />
        <ActionIcon
          icon={TwitterIcon}
          title={shareText("share-twitter")}
          component={TwitterShareButton}
        />
        <ActionIcon icon={TelegramIcon} component={TelegramShareButton} />
        {!!config.component?.share?.email && (
          <ActionIcon
            icon={EmailIcon}
            component={EmailShareButton}
            subject={shareText("share-subject")}
            body={shareText("share-body")}
            separator=" "
          />
        )}
        {!!config.component?.share?.reddit && (
          <ActionIcon icon={RedditIcon} component={RedditShareButton} />
        )}
        <ActionIcon icon={LinkedinIcon} component={LinkedinShareButton} />
      </CardActions>
    );
  }

  function ActionIcon(props) {
    const medium = props.component.render.displayName.replace(
      "ShareButton-",
      ""
    );
    function addShare(event) {
      if (config.component.share?.anonymous === true) return; // do not record the share if anonymous
      addAction(actionPage, event, {
        uuid: uuid(),
        payload: { key: "medium", value: medium },
        tracking: Url.utm(),
      });
    }

    function after(props) {
      addShare("share_close");
    }

    function before(props) {
      addShare("share_click");
      console.log("clicking " + medium);
    }
    let drillProps = Object.assign({}, props);
    delete drillProps.icon;
    return (
      <IconButton
        {...drillProps}
        component={props.component}
        url={shareUrl(props.component)}
        title={props.title || props.share || t("share.message")}
        beforeOnClick={() => before(props)}
        onShareWindowClose={() => after(props)}
      >
        {props.icon ? props.icon({ round: true, size: 48 }) : null}
      </IconButton>
    );
  }
}
