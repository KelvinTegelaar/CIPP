import React, { useCallback, useEffect, useState } from "react";
//import PropTypes from "prop-types";
//import { CippPage, CippMasonry, CippMasonryItem, CippContentCard } from "src/components/layout";
import { parseEml, readEml, GBKUTF8, decode } from "eml-parse-js";
import { useMediaPredicate } from "react-media-hook";
//import { useSelector } from "react-redux";
//import { CellDate } from "src/components/tables";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
/*import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
  CRow,
} from "@coreui/react";*/

import {
  Button,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Link,
  Typography,
  SvgIcon,
  CardHeader,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Box, Grid, Stack } from "@mui/system";

import {
  Image,
  VolumeUp,
  VideoFile,
  FileCopy,
  PictureAsPdf,
  Archive,
  Description,
  TableChart,
  Slideshow,
  Code,
  Email,
  Download,
  Visibility,
  AccountCircle,
  Close,
} from "@mui/icons-material";

//import ReactTimeAgo from "react-time-ago";
import { CippTimeAgo } from "./CippTimeAgo";
import { CippCodeBlock } from "./CippCodeBlock";
import DOMPurify from "dompurify";
import ReactHtmlParser from "react-html-parser";
import { FileDropzone } from "/src/components/file-dropzone.js";
import CippPageCard from "../CippCards/CippPageCard";

export const CippMessageViewer = ({ emailSource }) => {
  const [emlContent, setEmlContent] = useState(null);
  const [emlError, setEmlError] = useState(false);
  const [messageHtml, setMessageHtml] = useState("");
  const [emlHeaders, setEmlHeaders] = useState(null);
  const [anchorEl, setAnchorEl] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");

  const getAttachmentIcon = (contentType) => {
    if (contentType.includes("image")) {
      return <Image />;
    } else if (contentType.includes("audio")) {
      return <VolumeUp />;
    } else if (contentType.includes("video")) {
      return <VideoFile />;
    } else if (contentType.includes("text")) {
      return <FileCopy />;
    } else if (contentType.includes("pdf")) {
      return <PictureAsPdf />;
    } else if (
      contentType.includes("zip") ||
      contentType.includes("compressed") ||
      contentType.includes("tar") ||
      contentType.includes("gzip")
    ) {
      return <Archive />;
    } else if (contentType.includes("msword")) {
      return <Description />;
    } else if (contentType.includes("spreadsheet")) {
      return <TableChart />;
    } else if (contentType.includes("presentation")) {
      return <Slideshow />;
    } else if (contentType.includes("json") || contentType.includes("xml")) {
      return <Code />;
    } else if (contentType.includes("rfc822")) {
      return <Email />;
    } else {
      return <FileCopy />;
    }
  };

  const downloadAttachment = (attachment, newTab = false) => {
    var contentType = attachment?.contentType?.split(";")[0] ?? "text/plain";
    var fileBytes = attachment.data;
    if (fileBytes instanceof Uint8Array && attachment?.data64) {
      fileBytes = new Uint8Array(
        atob(attachment.data64)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
    }

    var fileName = attachment?.name ?? "attachment";
    const blob = new Blob([fileBytes], { type: contentType ?? "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    if (newTab) {
      if (contentType.includes("rfc822")) {
        var content = fileBytes;
        const nestedMessage = <CippMessageViewer emailSource={content} />;
        setDialogContent(nestedMessage);
        setDialogTitle(fileName);
        setDialogOpen(true);
      } else if (contentType.includes("pdf")) {
        const embeddedPdf = (
          <object data={url} type="application/pdf" width="100%" height="600px" />
        );
        setDialogContent(embeddedPdf);
        setDialogTitle(fileName);
        setDialogOpen(true);
      } else if (contentType.includes("image")) {
        const embeddedImage = <img src={url} alt={fileName} style={{ maxWidth: "100%" }} />;
        setDialogContent(embeddedImage);
        setDialogTitle(fileName);
        setDialogOpen(true);
      } else if (contentType.includes("text")) {
        const textContent = fileBytes;
        setDialogContent(
          <CippCodeBlock code={textContent} language="plain" showLineNumbers={false} />
        );
        setDialogTitle(fileName);
        setDialogOpen(true);
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } else {
        const newWindow = window.open();
        newWindow.location.href = url;
        URL.revokeObjectURL(url);
      }
    } else {
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  const showEmailModal = (emailSource, title = "Email Source") => {
    setDialogContent(<CippCodeBlock code={emailSource} language="plain" showLineNumbers={false} />);
    setDialogTitle(title);
    setDialogOpen(true);
  };

  const EmailButtons = (emailHeaders, emailSource) => {
    const emailSourceBytes = new TextEncoder().encode(emailSource);
    const blob = new Blob([emailSourceBytes], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    return (
      <Stack spacing={1} direction="row" sx={{ mt: 1.5, mr: 1 }}>
        {emailHeaders && (
          <Button
            size="small"
            variant="contained"
            onClick={() => showEmailModal(emailHeaders, "Email Headers")}
            startIcon={
              <SvgIcon fontSize="small">
                <Code />
              </SvgIcon>
            }
          >
            View Headers
          </Button>
        )}
        <Button
          size="small"
          variant="contained"
          onClick={() => showEmailModal(emailSource)}
          startIcon={
            <SvgIcon fontSize="small">
              <Email />
            </SvgIcon>
          }
        >
          View Source
        </Button>
      </Stack>
    );
  };

  useEffect(() => {
    readEml(emailSource, (err, ReadEmlJson) => {
      if (err) {
        setEmlError(true);
        setEmlContent(null);
        setMessageHtml(null);
        setEmlHeaders(null);
      } else {
        setEmlContent(ReadEmlJson);
        setEmlError(false);
        if (ReadEmlJson.html) {
          var sanitizedHtml = DOMPurify.sanitize(ReadEmlJson.html);
          var parsedHtml = ReactHtmlParser(sanitizedHtml);
          if (ReadEmlJson.attachments) {
            ReadEmlJson.attachments.forEach((attachment) => {
              if (attachment.id) {
                var cid = attachment.id.match(/<(.*)>/)[1];
                var base64 = attachment.data64;
                if (base64) {
                  const replaceCidWithBase64 = (element) => {
                    if (typeof element === "object" && element !== null) {
                      if (element.props.src === "cid:" + cid) {
                        return <img src={"data:image/png;base64," + base64} alt={cid} />;
                      } else if (element.props.children) {
                        return React.cloneElement(element, {
                          children: React.Children.map(
                            element.props.children,
                            replaceCidWithBase64
                          ),
                        });
                      }
                    }
                    return element;
                  };
                  parsedHtml = parsedHtml.map(replaceCidWithBase64);
                }
              }
            });
          }
          setMessageHtml(parsedHtml);
        } else {
          setMessageHtml(null);
        }
        const header_regex = /(?:^[\w-]+:\s?.*(?:\r?\n[ \t].*)*\r?\n?)+/gm;
        const headers = emailSource.match(header_regex);
        setEmlHeaders(headers ? headers[0] : null);
      }
    });
  }, [emailSource, setMessageHtml, setEmlError, setEmlContent, setEmlHeaders]);

  var buttons = EmailButtons(emlHeaders, emailSource);

  return (
    <>
      {emlError && (
        <Card className="mt-2 mb-4">
          <CardContent>
            <h2>Error</h2>
            Unable to parse the EML file, email source is displayed below.
            <CippCodeBlock code={emailSource} language="plain" showLineNumbers={false} />
          </CardContent>
        </Card>
      )}

      {emlContent && (
        <>
          <Card sx={{ mt: 2, mb: 4 }}>
            <CardHeader
              noTypography={true}
              title={<Typography variant="h4">{emlContent?.subject ?? "No subject"}</Typography>}
              action={buttons}
              sx={{ py: 0, my: 0 }}
            />
            <CardContent>
              <Grid
                container
                spacing={2}
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Grid item size={{ md: 12, lg: 10 }}>
                  <Box display="flex" alignItems="center">
                    <AccountCircle fontSize="large" sx={{ mr: 1 }} />
                    <Stack direction="row" spacing={0.5} alignItems="center" display="flex">
                      <b>{emlContent?.from?.name}</b>
                      <Typography variant="subtitle2" color="textSecondary">
                        &lt;{emlContent?.from?.email}&gt;
                      </Typography>
                    </Stack>
                  </Box>
                  {emlContent?.to?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2">
                        <b>To:</b>{" "}
                        {emlContent?.to?.map((to) => to.name + " <" + to.email + ">").join(", ")}
                      </Typography>
                    </Box>
                  )}
                  {emlContent?.cc?.length > 0 && (
                    <div>
                      <small>
                        <b>CC:</b>{" "}
                        {emlContent?.cc?.map((cc) => cc.name + " <" + cc.email + ">").join(", ")}
                      </small>
                    </div>
                  )}
                </Grid>
                <Grid item xs={12} lg={2}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Typography variant="subtitle2">
                      {emlContent.date && isValidDate(emlContent.date)
                        ? emlContent.date.toLocaleDateString()
                        : "Invalid Date"}
                    </Typography>
                    {emlContent.date && isValidDate(emlContent.date) && (
                      <Typography variant="subtitle2" color="textSecondary">
                        {" "}
                        (<CippTimeAgo data={emlContent.date} />)
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {emlContent.attachments && emlContent.attachments.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item size={12}>
                    <Stack spacing={1} direction="row">
                      {emlContent?.attachments?.map((attachment, index) => (
                        <React.Fragment key={index}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(event) =>
                              setAnchorEl({ ...anchorEl, [index]: event.currentTarget })
                            }
                            startIcon={
                              <SvgIcon fontSize="small">
                                {getAttachmentIcon(attachment?.contentType ?? "text/plain")}
                              </SvgIcon>
                            }
                          >
                            {attachment.name ?? "No name"}
                          </Button>

                          <Menu
                            anchorEl={anchorEl[index]}
                            open={Boolean(anchorEl[index])}
                            onClose={() => setAnchorEl({ ...anchorEl, [index]: null })}
                          >
                            <MenuItem onClick={() => downloadAttachment(attachment)}>
                              <Download sx={{ mr: 1 }} />
                              Download
                            </MenuItem>
                            {(attachment?.contentType === undefined ||
                              attachment?.contentType?.includes("text") ||
                              attachment?.contentType?.includes("pdf") ||
                              attachment?.contentType?.includes("image") ||
                              attachment?.contentType?.includes("rfc822")) && (
                              <MenuItem onClick={() => downloadAttachment(attachment, true)}>
                                <Visibility sx={{ mr: 1 }} />
                                View
                              </MenuItem>
                            )}
                          </Menu>
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {(emlContent?.text || emlContent?.html) && (
                <Grid container spacing={2}>
                  <Grid item size={12}>
                    <Divider />
                  </Grid>
                  <Grid item size={12}>
                    {messageHtml ? (
                      <div className="mt-4">{messageHtml}</div>
                    ) : (
                      <div className="mt-4">
                        <CippCodeBlock
                          code={emlContent?.text ?? "No text"}
                          language="plain"
                          showLineNumbers={false}
                        />
                      </div>
                    )}
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          {dialogTitle}
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>{dialogContent}</DialogContent>
      </Dialog>
    </>
  );
};

const CippMessageViewerPage = () => {
  const [emlFile, setEmlFile] = useState(null);
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        setEmlFile(reader.result);
      };
      reader.readAsText(file);
    });
  }, []);

  return (
    <CippPageCard title="Message Viewer" hideBackButton={true}>
      <FileDropzone
        onDrop={onDrop}
        accept={{ "message/rfc822": [".eml"] }}
        caption="Drag an EML file or click to add"
        maxFiles={1}
      />
      {emlFile && <CippMessageViewer emailSource={emlFile} />}
    </CippPageCard>
  );
};

export default CippMessageViewerPage;
