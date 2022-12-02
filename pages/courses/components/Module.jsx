import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Form, Space } from "antd";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
// import "antd/dist/antd.css";
import MarkdownIt from "markdown-it";

const mdParser = new MarkdownIt(/* Markdown-it options */);

function Module({ setCourseModuleList, setModuleSave }) {
  const onFinish = (values) => {
    console.log("Received values of form:", values);
    setCourseModuleList(values.modules);
    setModuleSave(false);
  };

  return (
    <>
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.List name="modules" className="wi">
          {(fields, { add, remove }) => (
            <>
              <Flex
                alignItems={"center"}
                justifyContent={"flex-end"}
                mt={"2em"}
              >
                <Button
                  borderWidth={"2px"}
                  borderColor={"rgb(10 10 10/1)"}
                  borderRadius={"0.625rem"}
                  py={"0.375rem"}
                  px={"1rem"}
                  colorScheme="whatsapp"
                  onClick={() => add()}
                >
                  Add Module
                </Button>
              </Flex>

              {fields.map(({ key, name, ...restField }) => (
                <>
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginTop: "1rem",
                      width: "100%",
                      flexDirection: "column",
                      padding: "1rem",
                      border: "2px solid rgb(10,10,10)",
                      borderRadius: "0.625rem",
                      alignItems: "stretch",
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "moduleName"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing first name",
                        },
                      ]}
                    >
                      <FormControl
                        className="wi"
                        isRequired
                        w={"100%"}
                        mt={"1em"}
                      >
                        <FormLabel>Module Name</FormLabel>
                        <Input className="wi" />
                      </FormControl>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "moduleDes"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing last name",
                        },
                      ]}
                    >
                      <FormControl isRequired mt={"1em"}>
                        <FormLabel>Module Description</FormLabel>
                        <Input />
                      </FormControl>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "moduleMaterial"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing last name",
                        },
                      ]}
                    >
                      <FormControl isRequired mt={"1em"}>
                        <FormLabel>Materials</FormLabel>
                        <Box>
                          <MdEditor
                            style={{ height: "500px" }}
                            renderHTML={(text) => mdParser.render(text)}
                            //   onChange={handleEditorChange}
                            placeholder="whats on your mind..."
                            fontSize={"20px"}
                            name="content"
                          />
                        </Box>
                      </FormControl>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "moduleQues"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing last name",
                        },
                      ]}
                    >
                      <FormControl isRequired mt={"1em"}>
                        <FormLabel>Questions</FormLabel>
                        <Box>
                          <MdEditor
                            style={{ height: "250px" }}
                            renderHTML={(text) => mdParser.render(text)}
                            //   onChange={handleEditorChange}
                            placeholder="whats on your mind..."
                            fontSize={"20px"}
                            name="content"
                          />
                        </Box>
                      </FormControl>
                    </Form.Item>

                    <Button
                      borderWidth={"2px"}
                      borderColor={"rgb(10 10 10/1)"}
                      borderRadius={"0.625rem"}
                      py={"0.375rem"}
                      px={"1rem"}
                      colorScheme={"red"}
                      mt={"1em"}
                      onClick={() => remove(name)}
                    >
                      Delete Module
                    </Button>
                  </Space>
                </>
              ))}
              {fields.length ? (
                <Flex
                  flexDirection={"column"}
                  alignItems={"flex-end"}
                  justifyContent={"flex-end"}
                >
                  <Button
                    borderWidth={"2px"}
                    borderColor={"rgb(10 10 10/1)"}
                    borderRadius={"0.625rem"}
                    p={"0.500rem 1rem 0.250rem"}
                    colorScheme="yellow"
                    htmlType="submit"
                    alignItems={"right"}
                    mt={"1em"}
                    type={"primary"}
                  >
                    Save
                  </Button>
                  <Text color={"#888888"} fontSize={"12px"} mt={"4px"}>
                    (click save before submit)
                  </Text>
                </Flex>
              ) : null}
            </>
          )}
        </Form.List>
      </Form>
    </>
  );
}

export default Module;
