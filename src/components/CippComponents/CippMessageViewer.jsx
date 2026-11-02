import React, { useCallback, useEffect, useState } from "react";
import { CippIcons } from "../../utils/icon-registry";
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
} from "@mui/material";
import { Box, Grid, Stack, ThemeProvider } from "@mui/system";
import { createTheme } from "@mui/material/styles";
import { CippTimeAgo } from "./CippTimeAgo";
import { CippCodeBlock } from "./CippCodeBlock";
import DOMPurify from "dompurify";
import ReactHtmlParser from "react-html-parser";
import { FileDropzone } from "../file-dropzone";
import CippPageCard from "../CippCards/CippPageCard";
import { useSettings } from "../../hooks/use-settings";
import CippForefrontHeaderDialog from "./CippForefrontHeaderDialog";
import { CippMessageDeliveryInfo } from "./CippMessageDeliveryInfo";
import { CippApiDialog } from "./CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";
import { CippTestMessageResults } from "./CippTestMessageResults";
import { decodeMimeEncodedWords } from "../../utils/decode-mime-encoded-words";
import { decodeTnef } from "../../utils/decode-tnef";

const bytesToBase64 = (bytes) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return window.btoa(binary);
};
const headerAddress = (headers, name) =>
  headers?.match(new RegExp(`^${name}:\\s*(.+)$`, "im"))?.[1]?.match(/[\w.+-]+@[\w.-]+/)?.[0] ?? "";

export const CippMessageViewer = ({ emailSource, emlBase64 }) => {
  const tenant = useSettings().currentTenant;
  const testMessageDialog = useDialog();
  const [testJobId, setTestJobId] = useState(null);
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

  const emailStyle = <GlobalStyles styles={{ a: { color: darkMode ? "#bb86fc" : "#1a73e8" } }} />;

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
      return <CippIcons.Image />;
    } else if (contentType.includes("audio")) {
      return <CippIcons.VolumeUp />;
    } else if (contentType.includes("video")) {
      return <CippIcons.VideoFile />;
    } else if (contentType.includes("text")) {
      return <CippIcons.FileCopy />;
    } else if (contentType.includes("pdf")) {
      return <CippIcons.PictureAsPdf />;
    } else if (
      contentType.includes("zip") ||
      contentType.includes("compressed") ||
      contentType.includes("tar") ||
      contentType.includes("gzip")
    ) {
      return <CippIcons.Archive />;
    } else if (contentType.includes("msword")) {
      return <CippIcons.Description />;
    } else if (contentType.includes("spreadsheet")) {
      return <CippIcons.TableChart />;
    } else if (contentType.includes("presentation")) {
      return <CippIcons.Slideshow />;
    } else if (contentType.includes("json") || contentType.includes("xml")) {
      return <CippIcons.Code />;
    } else if (contentType.includes("rfc822")) {
      return <CippIcons.Email />;
    } else {
      return <CippIcons.FileCopy />;
    }
  };

  const downloadAttachment = (attachment, newTab = false) => {
    var contentType = attachment?.contentType?.split(";")[0] ?? "text/plain";
    var fileBytes = attachment.data;
    if (fileBytes instanceof Uint8Array && attachment?.data64) {
      fileBytes = new Uint8Array(
        atob(attachment.data64)
          .split("")
          .map((c) => c.charCodeAt(0)),
      );
    }

    var fileName = decodeMimeEncodedWords(attachment?.name) ?? "attachment";
    const blob = new Blob([fileBytes], { type: contentType ?? "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    if (newTab) {
      if (contentType.includes("rfc822")) {
        var content =
          typeof fileBytes === "string" ? fileBytes : new TextDecoder().decode(fileBytes);
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
        const textContent =
          typeof fileBytes === "string" ? fileBytes : new TextDecoder().decode(fileBytes);
        setDialogContent(
          <CippCodeBlock
            code={textContent}
            language="plain"
            showLineNumbers={false}
            readOnly={true}
          />,
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
    setDialogContent(
      <CippCodeBlock code={emailSource} language="plain" showLineNumbers={false} readOnly={true} />,
    );
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
                <CippIcons.Code />
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
                <CippIcons.ReceiptLong />
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
              <CippIcons.Email />
            </SvgIcon>
          }
        >
          View Source
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={testMessageDialog.handleOpen}
          startIcon={
            <SvgIcon fontSize="small">
              <CippIcons.FactCheck />
            </SvgIcon>
          }
        >
          Test Mail Flow Rules
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
        // A top-level TNEF part is binary, so its bytes only survive in the base64 export.
        const tnefIsBody = /ms-tnef/i.test(ReadEmlJson.headers?.["Content-Type"] ?? "");
        ReadEmlJson.attachments = ReadEmlJson.attachments?.flatMap((attachment) => {
          if (!/ms-tnef/i.test(attachment.contentType ?? "")) return [attachment];
          let tnef = null;
          try {
            const fromExport = tnefIsBody && emlBase64;
            const raw = atob(fromExport ? emlBase64 : (attachment.data64 ?? ""));
            const source = fromExport ? raw.slice(raw.indexOf("\r\n\r\n") + 4) : raw;
            tnef = decodeTnef(Uint8Array.from(source, (c) => c.charCodeAt(0)));
          } catch {
            // undecodable winmail.dat stays a plain attachment
          }
          if (!tnef) return [attachment];
          ReadEmlJson.html ??= tnef.html;
          ReadEmlJson.text ??= tnef.text;
          return tnef.attachments.map((inner) => ({ ...inner, data64: bytesToBase64(inner.data) }));
        });
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
                            replaceCidWithBase64,
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
  }, [emailSource, emlBase64, setMessageHtml, setEmlError, setEmlContent, setEmlHeaders]);

  var buttons = EmailButtons(emlHeaders, emailSource);

  return (
    <>
      <CippMessageDeliveryInfo emailSource={emailSource} />
      <CippApiDialog
        title="Test Mail Flow Rules"
        createDialog={testMessageDialog}
        defaultvalues={(current) => ({
          Sender: current?.Sender ?? "",
          Recipients: current?.Recipients ?? "",
          TransportRules: true,
          UnifiedDlpRules: false,
        })}
        row={{
          MessageFileBase64: emlBase64 ?? bytesToBase64(new TextEncoder().encode(emailSource)),
          Sender: headerAddress(emlHeaders, "From"),
          Recipients: headerAddress(emlHeaders, "To"),
          TransportRules: true,
          UnifiedDlpRules: false,
        }}
        fields={[
          { type: "textField", name: "Sender", label: "Sender" },
          { type: "textField", name: "Recipients", label: "Recipients (comma separated)" },
          { type: "textField", name: "SendReportTo", label: "Send report to (a mailbox in this tenant)" },
          { type: "switch", name: "TransportRules", label: "Evaluate mail flow rules" },
          { type: "switch", name: "UnifiedDlpRules", label: "Evaluate unified DLP rules" },
        ]}
        api={{
          url: "/api/ExecTestMessage",
          type: "POST",
          confirmText:
            "This message is pushed through the tenant's rule pipeline without being delivered, and Exchange emails the report of every rule that matched. Rule actions such as block, moderate or notify can fire for it. Continue?",
          data: { MessageFileBase64: "MessageFileBase64", tenantFilter: tenant },
          onSuccess: (result) => setTestJobId(result?.DeploymentId ?? null),
        }}
      />
      <CippTestMessageResults jobId={testJobId} />

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
                <Grid size={{ xs: 12, md: 9 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center"
                    }}>
                    <CippIcons.AccountCircle fontSize="large" sx={{ mr: 1 }} />
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        display: "flex"
                      }}>
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
                          <CippIcons.ShieldExclamationIcon />
                        ) : allPass ? (
                          <CippIcons.ShieldCheckIcon />
                        ) : somePass ? (
                          <CippIcons.ShieldExclamationIcon />
                        ) : (
                          <CippIcons.ShieldExclamationIcon />
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
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack direction="row" spacing={0.5} sx={{
                    justifyContent: "flex-end"
                  }}>
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
                  <Grid size={12}>
                    <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: "wrap" }}>
                      {emlContent?.attachments?.map((attachment, index) => {
                        const attachmentName =
                          decodeMimeEncodedWords(attachment.name) ?? "No name";
                        return (
                          <React.Fragment key={index}>
                            <Tooltip title={attachmentName} placement="top">
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
                                sx={{ maxWidth: 280 }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {attachmentName}
                                </Box>
                              </Button>
                            </Tooltip>

                            <Menu
                              anchorEl={anchorEl[index]}
                              open={Boolean(anchorEl[index])}
                              onClose={() => setAnchorEl({ ...anchorEl, [index]: null })}
                            >
                              <MenuItem onClick={() => downloadAttachment(attachment)}>
                                <CippIcons.Download sx={{ mr: 1 }} />
                                Download
                              </MenuItem>
                              {(attachment?.contentType === undefined ||
                                attachment?.contentType?.includes("text") ||
                                attachment?.contentType?.includes("pdf") ||
                                attachment?.contentType?.includes("image") ||
                                attachment?.contentType?.includes("rfc822")) && (
                                <MenuItem onClick={() => downloadAttachment(attachment, true)}>
                                  <CippIcons.Visibility sx={{ mr: 1 }} />
                                  View
                                </MenuItem>
                              )}
                            </Menu>
                          </React.Fragment>
                        );
                      })}
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {(emlContent?.text || emlContent?.html) && (
                <Grid container spacing={2}>
                  <Grid size={12}>
                    {messageHtml ? (
                      <ThemeProvider theme={theme}>
                        {emailStyle}
                        <Card variant="outlined">
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mb: 1
                              }}>
                              <IconButton variant="text" onClick={toggleDarkMode}>
                                <SvgIcon>{darkMode ? <CippIcons.SunIcon /> : <CippIcons.MoonIcon />}</SvgIcon>
                              </IconButton>
                            </Box>
                            {/* Sanitized but untrusted layout: marketing mail ships fixed
                                <table width="600">s, so the message scrolls inside its own
                                card instead of widening the page body. */}
                            <Box
                              sx={{
                                overflowX: "auto",
                                "& img": { maxWidth: "100%", height: "auto" },
                              }}
                            >
                              {messageHtml}
                            </Box>
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
            <CippIcons.Close />
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
  const [inputMode, setInputMode] = useState("upload");
  const [pasteValue, setPasteValue] = useState("");
  const [pasteCollapsed, setPasteCollapsed] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result);
        setEmlFile({ text: new TextDecoder().decode(bytes), base64: bytesToBase64(bytes) });
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setInputMode(newMode);
      setEmlFile(null);
      setPasteCollapsed(false);
    }
  };

  const handleAnalyze = () => {
    setEmlFile({ text: pasteValue });
    setPasteCollapsed(true);
  };

  return (
    <CippPageCard title="Message Viewer" hideBackButton={true}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2
        }}>
        <ToggleButtonGroup
          color="primary"
          exclusive
          size="small"
          value={inputMode}
          onChange={handleModeChange}
        >
          <ToggleButton value="upload">Upload EML</ToggleButton>
          <ToggleButton value="paste">Paste headers / source</ToggleButton>
        </ToggleButtonGroup>

        {inputMode === "paste" && (
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Button
              variant="contained"
              disabled={!pasteValue.trim()}
              onClick={handleAnalyze}
              startIcon={
                <SvgIcon fontSize="small">
                  <CippIcons.ReceiptLong />
                </SvgIcon>
              }
            >
              Analyze
            </Button>
            <Tooltip title={pasteCollapsed ? "Show input" : "Hide input"}>
              <IconButton size="small" onClick={() => setPasteCollapsed((prev) => !prev)}>
                <SvgIcon fontSize="small">
                  {pasteCollapsed ? <CippIcons.ExpandMore /> : <CippIcons.ExpandLess />}
                </SvgIcon>
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {inputMode === "upload" ? (
        <FileDropzone
          onDrop={onDrop}
          accept={{ "message/rfc822": [".eml"] }}
          caption="Drag an EML file or click to add"
          maxFiles={1}
        />
      ) : (
        <Collapse in={!pasteCollapsed} unmountOnExit>
          <TextField
            multiline
            minRows={8}
            fullWidth
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="Paste raw email headers or the full message source here"
            slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: "0.8rem" } } }}
          />
        </Collapse>
      )}

      {emlFile && <CippMessageViewer emailSource={emlFile.text} emlBase64={emlFile.base64} />}
    </CippPageCard>
  );
};

export default CippMessageViewerPage;
