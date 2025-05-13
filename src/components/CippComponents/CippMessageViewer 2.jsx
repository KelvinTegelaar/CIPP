import React, { useCallback, useEffect, useState } from "react";
import { readEml } from "eml-parse-js";

import {
  Button,
  Card,
  CardContent,
  GlobalStyles,
  Menu,
  MenuItem,
  Typography,
  SvgIcon,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Box, Grid, Stack, ThemeProvider } from "@mui/system";
import { createTheme } from "@mui/material/styles";

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
  ReceiptLong,
} from "@mui/icons-material";

import { CippTimeAgo } from "./CippTimeAgo";
import { CippCodeBlock } from "./CippCodeBlock";
import DOMPurify from "dompurify";
import ReactHtmlParser from "react-html-parser";
import { FileDropzone } from "/src/components/file-dropzone.js";
import CippPageCard from "../CippCards/CippPageCard";
import {
  MoonIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useSettings } from "/src/hooks/use-settings";
import CippForefrontHeaderDialog from "./CippForefrontHeaderDialog";

export const CippMessageViewer = ({ emailSource }) => {
  const [emlContent, setEmlContent] = useState(null);
  const [emlError, setEmlError] = useState(false);
  const [messageHtml, setMessageHtml] = useState("");
  const [emlHeaders, setEmlHeaders] = useState(null);
  const [anchorEl, setAnchorEl] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [forefrontDialogOpen, setForefrontDialogOpen] = useState(false);
  const [forefrontHeader, setForefrontHeader] = useState("");

  const currentTheme = useSettings()?.currentTheme?.value;
  const [darkMode, setDarkMode] = useState(currentTheme === "dark");

  const emailStyle = (
    <GlobalStyles styles={{ a: { color: darkMode ? "#bb86fc" : "#1a73e8" } }} />
  );

  const theme = createTheme({
    palette: {
      background: {
        default: darkMode ? "#121212" : "#ffffff",
        paper: darkMode ? "#1d1d1d" : "#f5f5f5",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#000000",
        secondary: darkMode ? "#b0bec5" : "#757575",
      },
      action: {
        active: darkMode ? "#ffffff" : "#000000",
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

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

  const showForefrontDialog = (header) => {
    setForefrontHeader(header);
    setForefrontDialogOpen(true);
  };

  const EmailButtons = (emailHeaders, emailSource) => {
    const emailSourceBytes = new TextEncoder().encode(emailSource);
    const blob = new Blob([emailSourceBytes], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const forefrontHeader = emailHeaders?.match(/X-Forefront-Antispam-Report: (.*)/)?.[1];
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
        {forefrontHeader && (
          <Button
            size="small"
            variant="contained"
            onClick={() => showForefrontDialog(forefrontHeader)}
            startIcon={
              <SvgIcon fontSize="small">
                <ReceiptLong />
              </SvgIcon>
            }
          >
            Anti-Spam Report
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
                <Grid item size={{ xs: 12, md: 9 }}>
                  <Box display="flex" alignItems="center">
                    <AccountCircle fontSize="large" sx={{ mr: 1 }} />
                    <Stack direction="row" spacing={0.5} alignItems="center" display="flex">
                      <b>{emlContent?.from?.name}</b>
                      <Typography variant="subtitle2" color="textSecondary">
                        &lt;{emlContent?.from?.email}&gt;
                      </Typography>

                      {(() => {
                        const authResults = emlContent?.headers?.["Authentication-Results"] || "";
                        const dmarcPass = authResults ? authResults.includes("dmarc=pass") : false;
                        const dkimPass = authResults ? authResults.includes("dkim=pass") : false;
                        const spfPass = authResults ? authResults.includes("spf=pass") : false;
                        const arcPass = authResults ? authResults.includes("arc=pass") : false;
                        const allPass = dmarcPass && dkimPass && spfPass && arcPass;
                        const somePass = dmarcPass || dkimPass || spfPass || arcPass;
                        const noResults = authResults === "";
                        const color = noResults
                          ? ""
                          : allPass
                          ? "green"
                          : somePass
                          ? "orange"
                          : "red";
                        const icon = noResults ? (
                          <ShieldExclamationIcon />
                        ) : allPass ? (
                          <ShieldCheckIcon />
                        ) : somePass ? (
                          <ShieldExclamationIcon />
                        ) : (
                          <ShieldExclamationIcon />
                        );

                        return (
                          <Tooltip
                            title={
                              noResults
                                ? "No authentication results available"
                                : `${
                                    allPass
                                      ? "All authentication checks successful"
                                      : somePass
                                      ? "Some authentication checks failed"
                                      : "None of the authentication checks passed"
                                  } - DMARC: ${dmarcPass ? "pass" : "fail"}, DKIM: ${
                                    dkimPass ? "pass" : "fail"
                                  }, SPF: ${spfPass ? "pass" : "fail"}, ARC: ${
                                    arcPass ? "pass" : "fail"
                                  }`
                            }
                            placement="top"
                          >
                            <SvgIcon fontSize="small" sx={{ color }} style={{ cursor: "pointer" }}>
                              {icon}
                            </SvgIcon>
                          </Tooltip>
                        );
                      })()}
                    </Stack>
                  </Box>

                  {emlContent?.to && (
                    <Box>
                      <Typography variant="subtitle2">
                        <b>To:</b>{" "}
                        {Array.isArray(emlContent.to)
                          ? emlContent.to.map((to) => to.name + " <" + to.email + ">").join(", ")
                          : emlContent.to.name + " <" + emlContent.to.email + ">"}
                      </Typography>
                    </Box>
                  )}
                  {emlContent?.cc && (
                    <div>
                      <small>
                        <b>CC:</b>{" "}
                        {Array.isArray(emlContent.cc)
                          ? emlContent.cc.map((cc) => cc.name + " <" + cc.email + ">").join(", ")
                          : emlContent.cc.name + " <" + emlContent.cc.email + ">"}
                      </small>
                    </div>
                  )}
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
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
                    {messageHtml ? (
                      <ThemeProvider theme={theme}>
                        {emailStyle}
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" justifyContent="flex-end" mb={1}>
                              <IconButton variant="text" onClick={toggleDarkMode}>
                                <SvgIcon>{darkMode ? <SunIcon /> : <MoonIcon />}</SvgIcon>
                              </IconButton>
                            </Box>
                            {messageHtml}
                          </CardContent>
                        </Card>
                      </ThemeProvider>
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
      <CippForefrontHeaderDialog
        open={forefrontDialogOpen}
        onClose={() => setForefrontDialogOpen(false)}
        header={forefrontHeader}
      />
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
