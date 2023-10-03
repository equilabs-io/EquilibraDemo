import React, { useState, FormEvent } from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useDebounce } from "../hooks/useDebounce";
import * as ProjectRegistry from "../abi/ProjectRegistry.json";
import { toast } from "react-toastify";

export const CreateProjectForm = () => {
  const [beneficary, setBeneficary] = useState("");
  const [description, setDescription] = useState("");

  const crypto = require("crypto");

  const ipfsJsonUpload = async () => {
    try {
      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: JSON.stringify({ description: description }),
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  function hashStringToBytes32(stringToHash: string) {
    // Create a hash object using the SHA-256 algorithm
    const hash = crypto.createHash("sha256");

    // Update the hash object with the string to be hashed
    hash.update(stringToHash);

    // Generate the hexadecimal hash code
    const hexHash = hash.digest("hex");

    // Convert the hexadecimal hash to a 32-byte buffer by padding with zeroes
    const bytes32Hash = Buffer.alloc(32, "0", "hex");
    Buffer.from(hexHash, "hex").copy(bytes32Hash, 0, 0, 32);

    return bytes32Hash;
  }

  const debouncedBeneficiary = useDebounce(beneficary);

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite();
  //     {
  //     address: ProjectRegistry.address,
  //     abi: ProjectRegistry.abi,
  //     functionName: "registerProject",
  //     args: [beneficary, contentHash],
  //     overrides: {
  //       gasLimit: 1800000,
  //     },
  //   }

  const { data, error, isError, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("beneficiary: " + beneficary);

    console.log("description: " + description);

    const ipfsUpload = ipfsJsonUpload();

    toast.promise(ipfsUpload, {
      pending: "Uploading to IPFS...",
      success: "Successfully uploaded!",
      error: "Ups, something went wrong with IPFS.",
    });

    // hashStringToBytes32(description);

    //console.log("content", hashStringToBytes32(contentHash));
    // write?.();
  };

  return (
    <div className="space-y-10  divide-gray-900/10 ">
      <div className="">
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="bg-slate-800 shadow-sm  sm:rounded-xl "
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="">
              <div className="sm:col-span-4">
                <label
                  htmlFor="address"
                  className="text-sm font-medium leading-6 text-gray-200"
                >
                  Beneficiary
                </label>
                <div className="mt-2">
                  <div className="flex">
                    <input
                      type="text"
                      name="address"
                      className="p-2 w-full rounded-md text-sm text-black bg-blue-100"
                      placeholder="address.."
                      onChange={(e) => setBeneficary(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium leading-6 text-gray-200"
                >
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full text-sm text-black rounded-md p-2 outline-none bg-blue-100"
                    defaultValue={""}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Write a few words about you project...
                </p>
              </div>
              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm font-medium leading-6 text-gray-200"
                >
                  Cover photo
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-200/25 px-6 py-10">
                  <div className="text-center">
                    {/* <PhotoIcon
                      className="mx-auto h-12 w-12 text-gray-300"
                      aria-hidden="true"
                    /> */}
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md text-indigo-600"
                      >
                        <span>Upload a file</span>
                        <input
                          disabled={true}
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only cursor-not-allowed"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 px-4 py-4 sm:px-8">
            <button
              type="submit"
              className="rounded-full capitalize font-normal font-white w-full  transition-all tracking-widest flex items-center justify-center hover:bg-white hover:text-black border-2"
              //   onClick={hanldeSubmit}
            >
              Send Transaction
            </button>
          </div>
        </form>
      </div>
      {isSuccess && (
        <div className="text-green-300">
          Successfully Created a Project!
          <div>
            <a href={`https://goerli.etherscan.io/tx/${data?.hash}`}>
              Check etherscan Transaction Hash
            </a>
          </div>
        </div>
      )}
      {isError && (
        <div className="text-red-500 mt-4 ">Error: {error?.message}</div>
      )}
      <div className="border-2 w-full">
        <a
          href="/projects"
          className="border-4 border-sky-200 text-center rounded-md  text-red-300"
        >
          Check out registered Proyects
        </a>
      </div>
    </div>
  );
};
